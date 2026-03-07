struct Params {
    spot: f32,
    strike: f32,
    time: f32,
    rate: f32,
    vol: f32,
    num_paths: u32,
    steps: u32,
    seed: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> payoffs: array<f32>;

// PCG (Permuted Congruential Generator) for high-quality pseudo-randomness on GPU
fn pcg(state: ptr<function, u32>) -> f32 {
    let oldstate = *state;
    *state = oldstate * 747796405u + 2891336453u;
    let word = ((oldstate >> ((oldstate >> 28u) + 4u)) ^ oldstate) * 277803737u;
    let result = (word >> 22u) ^ word;
    return f32(result) / 4294967295.0; // Normalize to [0, 1]
}

// Box-Muller transform for normal distribution
fn rand_norm(state: ptr<function, u32>) -> f32 {
    let u1 = max(1e-7, pcg(state));
    let u2 = pcg(state);
    let r = sqrt(-2.0 * log(u1));
    let theta = 6.28318530718 * u2;
    return r * cos(theta);
}

@compute @workgroup_size(64)
fn mcComputePipeline(@builtin(global_invocation_id) id: vec3<u32>) {
    let idx = id.x;
    if (idx >= params.num_paths) {
        return;
    }

    // Hash thread ID with global seed for unique streams
    var state = idx * 1973u + u32(params.seed * 100000.0) + 1u;
    
    // Seed warmup
    pcg(&state);
    pcg(&state);

    let dt = params.time / f32(params.steps);
    let drift = (params.rate - 0.5 * params.vol * params.vol) * dt;
    let vol_sqrt_dt = params.vol * sqrt(dt);

    var current_price = params.spot;

    for (var i = 0u; i < params.steps; i = i + 1u) {
        let z = rand_norm(&state);
        current_price = current_price * exp(drift + vol_sqrt_dt * z);
    }

    let payoff = max(current_price - params.strike, 0.0);
    payoffs[idx] = payoff;
}
