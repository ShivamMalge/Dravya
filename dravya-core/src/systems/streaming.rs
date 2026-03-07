use wasm_bindgen::prelude::*;
use web_sys::{ErrorEvent, MessageEvent, WebSocket};
use prost::Message;
use tonic_web_wasm_client::Client;

#[derive(Clone, PartialEq, Message)]
pub struct MarketDataSnapshot {
    #[prost(string, tag="1")]
    pub symbol: String,
    #[prost(double, tag="2")]
    pub price: f64,
    #[prost(uint64, tag="3")]
    pub timestamp: u64,
}

#[wasm_bindgen]
pub struct wsMarketStream {
    ws: WebSocket,
}

#[wasm_bindgen]
impl wsMarketStream {
    #[wasm_bindgen(constructor)]
    pub fn new(url: &str) -> Result<wsMarketStream, JsValue> {
        let ws = WebSocket::new(url)?;
        ws.set_binary_type(web_sys::BinaryType::Arraybuffer);
        
        let onmessage_callback = Closure::<dyn FnMut(_)>::new(move |e: MessageEvent| {
            if let Ok(abuf) = e.data().dyn_into::<js_sys::ArrayBuffer>() {
                let _array = js_sys::Uint8Array::new(&abuf);
            } else if let Ok(_txt) = e.data().dyn_into::<js_sys::JsString>() {
            }
        });
        
        ws.set_onmessage(Some(onmessage_callback.as_ref().unchecked_ref()));
        onmessage_callback.forget();
        
        let onerror_callback = Closure::<dyn FnMut(_)>::new(move |e: ErrorEvent| {
            web_sys::console::error_1(&e.into());
        });
        
        ws.set_onerror(Some(onerror_callback.as_ref().unchecked_ref()));
        onerror_callback.forget();
        
        Ok(wsMarketStream { ws })
    }
    
    pub fn subscribe(&self, payload: &str) -> Result<(), JsValue> {
        self.ws.send_with_str(payload)
    }
    
    pub fn send_binary(&self, payload: &[u8]) -> Result<(), JsValue> {
        self.ws.send_with_u8_array(payload)
    }
}

#[wasm_bindgen]
pub struct grpcWebClient {
    endpoint: String,
}

#[wasm_bindgen]
impl grpcWebClient {
    #[wasm_bindgen(constructor)]
    pub fn new(endpoint: &str) -> grpcWebClient {
        let _client = Client::new(endpoint.to_string());
        
        grpcWebClient {
            endpoint: endpoint.to_string(),
        }
    }

    pub fn connection_status(&self) -> String {
        format!("gRPC-Web client configured for endpoint: {}", self.endpoint)
    }
}

#[wasm_bindgen]
pub struct LiveTelemetry {
    packets_received: u64,
    latency_ms: f64,
    start_time: f64,
}

#[wasm_bindgen]
impl LiveTelemetry {
    #[wasm_bindgen(constructor)]
    pub fn new() -> LiveTelemetry {
        let start_time = if let Some(window) = web_sys::window() {
            if let Some(perf) = window.performance() {
                perf.now()
            } else { 0.0 }
        } else { 0.0 };
        
        LiveTelemetry {
            packets_received: 0,
            latency_ms: 0.0,
            start_time,
        }
    }

    pub fn track_packet(&mut self, latency: f64) {
        self.packets_received += 1;
        if self.packets_received == 1 {
            self.latency_ms = latency;
        } else {
            self.latency_ms = (self.latency_ms * 0.9) + (latency * 0.1); 
        }
    }

    pub fn packets_per_second(&self) -> f64 {
        let now = if let Some(window) = web_sys::window() {
            if let Some(perf) = window.performance() {
                perf.now()
            } else { return 0.0 }
        } else { return 0.0 };
        
        let elapsed_seconds = (now - self.start_time) / 1000.0;
        if elapsed_seconds > 0.0 {
            self.packets_received as f64 / elapsed_seconds
        } else {
            0.0
        }
    }
    
    pub fn current_latency(&self) -> f64 {
        self.latency_ms
    }
}
