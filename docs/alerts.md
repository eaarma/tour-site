# Alerts

Alerting is implemented using **Prometheus Alert Rules** and **Alertmanager**,
with notifications delivered via **Telegram**.

---

## Alert Flow

1. Prometheus evaluates alert rules every 15 seconds
2. When an alert condition is met for the configured duration:
   - Alert fires
3. Alertmanager receives the alert
4. Alertmanager sends a notification to Telegram

---

## Alertmanager

Alertmanager runs as a container and exposes its UI on:
http://<server-ip>:9093

It is configured using:

alertmanager/alertmanager.yml

Environment variables are provided via `.env.prod`.

---

## Telegram Notifications

Alerts are sent using a Telegram bot.

### Required environment variables

```env
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=<chat-id>

Example alert message
🚨 Alert: Backend is down
Severity: critical
Description: store-manager backend has been unreachable for over 1 minute.
```

Active Alerts:

BackendDown:
Triggered when backend is unreachable
Uses Prometheus up metric

BackendHighErrorRate:
Triggered when >5% of HTTP requests return 5xx
Uses Spring Boot HTTP metrics

BackendHighLatency:
Triggered when p95 latency exceeds threshold
Based on request duration histograms

BackendJvmMemoryHigh:
Triggered when JVM heap usage exceeds 85%

Testing Alerts
To test alerts manually:

docker stop store-manager-backend

Wait for alert duration to pass, then verify:

Alert appears in Prometheus

Alert appears in Alertmanager

Telegram notification is delivered

Restart backend afterward:

docker start store-manager-backend

Troubleshooting Alerts

Check Prometheus rules status:

Status → Rules

Check Alertmanager logs:

docker logs alertmanager

Verify environment variables:

docker exec -it alertmanager env

Notes

Email alerts were intentionally replaced with Telegram due to
modern SMTP security restrictions.

Telegram provides faster, more reliable alert delivery for production use.
