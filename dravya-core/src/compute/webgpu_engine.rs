use crate::error::DravyaError;
use serde::Serialize;
use bytemuck::{Pod, Zeroable};
use futures_channel::oneshot;

#[derive(Serialize)]
pub struct MonteCarloResult {
    pub mean_price: f64,
    pub standard_error: f64,
    pub computing_backend: String,
    pub time_ms: f64,
}

#[repr(C)]
#[derive(Copy, Clone, Debug, Pod, Zeroable)]
pub struct McParams {
    spot: f32,
    strike: f32,
    time: f32,
    rate: f32,
    vol: f32,
    num_paths: u32,
    steps: u32,
    seed: f32,
}

pub async fn dispatch_pricing_kernel(
    spot: f64, strike: f64, time: f64, rate: f64, vol: f64,
    num_paths: u32, steps: u32, seed: f64,
) -> Result<MonteCarloResult, DravyaError> {
    let start_time = web_sys::window().unwrap().performance().unwrap().now();
    
    let instance = wgpu::Instance::default();
    let adapter_opt = instance.request_adapter(&wgpu::RequestAdapterOptions {
        power_preference: wgpu::PowerPreference::HighPerformance,
        force_fallback_adapter: false,
        compatible_surface: None,
    }).await;

    let adapter = match adapter_opt {
        Some(a) => a,
        None => return Ok(cpu_fallback(spot, strike, time, rate, vol, num_paths, steps, seed, start_time)),
    };

    let (device, queue) = match adapter.request_device(&wgpu::DeviceDescriptor::default(), None).await {
        Ok(dq) => dq,
        Err(_) => return Ok(cpu_fallback(spot, strike, time, rate, vol, num_paths, steps, seed, start_time)),
    };

    let sm = device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: Some("Monte Carlo Shader"),
        source: wgpu::ShaderSource::Wgsl(include_str!("../shaders/monte_carlo.wgsl").into()),
    });

    let params = McParams {
        spot: spot as f32,
        strike: strike as f32,
        time: time as f32,
        rate: rate as f32,
        vol: vol as f32,
        num_paths,
        steps,
        seed: seed as f32,
    };

    let params_bytes = bytemuck::bytes_of(&params);
    
    let params_buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("Params Buffer"),
        size: params_bytes.len() as wgpu::BufferAddress,
        usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
    });
    
    queue.write_buffer(&params_buffer, 0, params_bytes);

    let output_size = (num_paths as usize * std::mem::size_of::<f32>()) as wgpu::BufferAddress;
    
    let storage_buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("Output Storage Buffer"),
        size: output_size,
        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_SRC,
        mapped_at_creation: false,
    });

    let staging_buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("Staging Buffer"),
        size: output_size,
        usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
    });

    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        label: Some("MC Bind Group Layout"),
        entries: &[
            wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
            wgpu::BindGroupLayoutEntry {
                binding: 1,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: false },
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
        ],
    });

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
        label: Some("MC Bind Group"),
        layout: &bind_group_layout,
        entries: &[
            wgpu::BindGroupEntry {
                binding: 0,
                resource: params_buffer.as_entire_binding(),
            },
            wgpu::BindGroupEntry {
                binding: 1,
                resource: storage_buffer.as_entire_binding(),
            },
        ],
    });

    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("MC Pipeline Layout"),
        bind_group_layouts: &[&bind_group_layout],
        push_constant_ranges: &[],
    });

    let compute_pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
        label: Some("MC Compute Pipeline"),
        layout: Some(&pipeline_layout),
        module: &sm,
        entry_point: "mcComputePipeline",
    });

    let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });
    {
        let mut cpass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
            label: None,
            timestamp_writes: None,
        });
        cpass.set_pipeline(&compute_pipeline);
        cpass.set_bind_group(0, &bind_group, &[]);
        let workgroups = (num_paths + 63) / 64;
        cpass.dispatch_workgroups(workgroups, 1, 1);
    }

    encoder.copy_buffer_to_buffer(&storage_buffer, 0, &staging_buffer, 0, output_size);
    queue.submit(Some(encoder.finish()));

    let buffer_slice = staging_buffer.slice(..);
    let (sender, receiver) = oneshot::channel();
    buffer_slice.map_async(wgpu::MapMode::Read, move |v| { sender.send(v).unwrap(); });
    
    receiver.await.map_err(|_| DravyaError::ComputeError("Failed to map buffer".to_string()))?.map_err(|_| DravyaError::ComputeError("Buffer Async Error".to_string()))?;

    let data = buffer_slice.get_mapped_range();
    let result_paths: &[f32] = bytemuck::cast_slice(&data);

    let mut sum = 0.0;
    let mut sum_sq = 0.0;
    
    for &payoff in result_paths.iter() {
        let p = payoff as f64;
        sum += p;
        sum_sq += p * p;
    }
    
    drop(data);
    staging_buffer.unmap();

    let mean_price = sum / num_paths as f64;
    let variance = (sum_sq / num_paths as f64) - (mean_price * mean_price);
    let standard_error = (variance / num_paths as f64).sqrt();

    let end_time = web_sys::window().unwrap().performance().unwrap().now();

    Ok(MonteCarloResult {
        mean_price: (mean_price * (-rate * time).exp() * 1e6).round() / 1e6, 
        standard_error: (standard_error * (-rate * time).exp() * 1e6).round() / 1e6,
        computing_backend: "WebGPU".to_string(),
        time_ms: end_time - start_time,
    })
}

fn cpu_fallback(
    spot: f64, strike: f64, time: f64, rate: f64, vol: f64,
    num_paths: u32, steps: u32, _seed: f64, start_time: f64
) -> MonteCarloResult {
    let mut sum = 0.0;
    let mut sum_sq = 0.0;
    
    // CPU Fallback logic caps paths at 50,000 to prevent WebAssembly infinite freezing
    let paths_limit = num_paths.min(50000); 

    let dt = time / steps as f64;
    let drift = (rate - 0.5 * vol * vol) * dt;
    let vol_sqrt_dt = vol * dt.sqrt();

    let mut state = crate::get_global_seed() as u32;
    let mut rnd = || -> f64 {
        state = state.wrapping_mul(747796405).wrapping_add(2891336453);
        let word = ((state >> ((state >> 28) + 4)) ^ state).wrapping_mul(277803737);
        let r = (word >> 22) ^ word;
        (r as f64) / 4294967295.0
    };

    let mut rand_norm = || -> f64 {
        let u1 = rnd().max(1e-7);
        let u2 = rnd();
        let r = (-2.0 * u1.ln()).sqrt();
        let theta = 6.28318530718 * u2;
        r * theta.cos()
    };

    for _ in 0..paths_limit {
        let mut p = spot;
        for _ in 0..steps {
            p = p * (drift + vol_sqrt_dt * rand_norm()).exp();
        }
        let payoff = (p - strike).max(0.0);
        sum += payoff;
        sum_sq += payoff * payoff;
    }

    let mean_price = sum / paths_limit as f64;
    let variance = (sum_sq / paths_limit as f64) - (mean_price * mean_price);
    let standard_error = (variance / paths_limit as f64).sqrt();

    let end_time = web_sys::window().unwrap().performance().unwrap().now();

    MonteCarloResult {
        mean_price: (mean_price * (-rate * time).exp() * 1e6).round() / 1e6,
        standard_error: (standard_error * (-rate * time).exp() * 1e6).round() / 1e6,
        computing_backend: "WASM-CPU".to_string(),
        time_ms: end_time - start_time,
    }
}
