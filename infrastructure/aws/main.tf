resource "aws_sqs_queue" "event_queue" {
  name = "${var.project_name}-events"
  visibility_timeout_seconds = 30
}

resource "aws_sqs_queue" "event_dlq" {
  name = "${var.project_name}-events-dlq"
}

resource "aws_cloudwatch_log_group" "lab" {
  name = "/cloud-event-lab/simulation"
  retention_in_days = 14
}

output "queue_url" {
  value = aws_sqs_queue.event_queue.url
}
