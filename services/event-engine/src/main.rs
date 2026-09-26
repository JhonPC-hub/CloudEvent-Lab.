use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{net::SocketAddr, sync::Arc, time::Instant};
use tokio::sync::RwLock;
use tower_http::cors::CorsLayer;
use tracing::info;
use uuid::Uuid;

#[derive(Clone)]
struct AppState {
    events: Arc<RwLock<Vec<ProcessedEvent>>>,
}

#[derive(Debug, Deserialize)]
struct EventRequest {
    #[serde(rename = "type")]
    event_type: String,
    source: String,
    payload: Value,
}

#[derive(Debug, Serialize, Clone)]
struct ProcessedEvent {
    id: Uuid,
    event_type: String,
    source: String,
    payload: Value,
    checksum: String,
    status: String,
    processed_by: String,
    duration_us: u128,
}

#[derive(Debug, Serialize)]
struct Metrics {
    engine: String,
    total_events: usize,
    successful_events: usize,
    average_processing_us: u128,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    let state = AppState {
        events: Arc::new(RwLock::new(Vec::new())),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/metrics", get(metrics))
        .route("/process", post(process))
        .with_state(state)
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 4100));
    info!("Rust Event Engine listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "engine": "rust",
        "runtime": "tokio"
    }))
}

async fn metrics(State(state): State<AppState>) -> Json<Metrics> {
    let events = state.events.read().await;
    let total = events.len();
    let successful = events.iter().filter(|e| e.status == "SUCCESS").count();
    let avg = if total == 0 {
        0
    } else {
        events.iter().map(|e| e.duration_us).sum::<u128>() / total as u128
    };

    Json(Metrics {
        engine: "rust".into(),
        total_events: total,
        successful_events: successful,
        average_processing_us: avg,
    })
}

async fn process(
    State(state): State<AppState>,
    Json(request): Json<EventRequest>,
) -> Result<Json<ProcessedEvent>, (StatusCode, Json<Value>)> {
    let started = Instant::now();

    if request.event_type.trim().is_empty() || request.source.trim().is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "event type and source are required"})),
        ));
    }

    let canonical = serde_json::to_vec(&request.payload).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "invalid payload"})),
        )
    })?;

    let mut hasher = Sha256::new();
    hasher.update(&canonical);
    let checksum = format!("{:x}", hasher.finalize());

    let event = ProcessedEvent {
        id: Uuid::new_v4(),
        event_type: request.event_type,
        source: request.source,
        payload: request.payload,
        checksum,
        status: "SUCCESS".into(),
        processed_by: "rust-event-engine".into(),
        duration_us: started.elapsed().as_micros(),
    };

    state.events.write().await.insert(0, event.clone());

    Ok(Json(event))
}
