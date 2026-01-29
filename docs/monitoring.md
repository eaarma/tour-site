# Monitoring

This project uses **Prometheus**, **Grafana**, **cAdvisor**, and **Spring Boot Actuator**
to provide infrastructure- and application-level monitoring in production.

The setup is container-based and runs alongside the application using Docker Compose.

---

## Components

### Prometheus

- Scrapes metrics from all monitored services
- Evaluates alert rules
- Exposes a web UI on port `9090`

**Scrape targets:**

- Backend (Spring Boot Actuator)
- Prometheus itself
- cAdvisor (container metrics)
- Node Exporter (host metrics)

---

### Spring Boot Actuator (Backend)

The backend exposes metrics at:
/actuator/prometheus

Enabled metrics include:

- HTTP request counts & latencies
- JVM memory usage
- JVM GC statistics
- Application startup time
- Thread counts

These metrics are scraped by Prometheus under the `backend` job.

---

### cAdvisor

cAdvisor provides **container-level metrics**, including:

- CPU usage
- Memory usage
- Network traffic
- Container restarts

Metrics endpoint:

http://cadvisor:8080/metrics

These metrics are used by Docker-related Grafana dashboards.

---

### Node Exporter

Node Exporter provides **host-level metrics**, including:

- CPU load
- Memory usage
- Disk usage
- Filesystem stats
- System uptime

Metrics endpoint:
http://node-exporter:9100/metrics

---

### Grafana

Grafana provides dashboards for:

- Spring Boot application metrics
- Prometheus health
- Container resource usage
- Host resource usage

Grafana runs on port:
3002

Default credentials (change in production):

username: admin
password: admin

Dashboards may require variable adjustments depending on metric labels.

---

## Accessing UIs

| Service      | URL                     |
| ------------ | ----------------------- |
| Prometheus   | http://<server-ip>:9090 |
| Alertmanager | http://<server-ip>:9093 |
| Grafana      | http://<server-ip>:3002 |

> For security, these ports should ideally be accessed via SSH port forwarding or firewall rules.

---

## Notes

- Prometheus and Grafana dashboards may show `N/A` if dashboard variables
  do not match actual metric labels.
- Metrics themselves are confirmed to be present and correct via Prometheus.
- Custom dashboards can be built incrementally based on confirmed metrics.

---

## Troubleshooting

- Check Prometheus targets:

Status → Targets

- Verify metrics exist using Prometheus UI or Grafana Explore
- Restart Prometheus if rule files change:

docker compose up -d --force-recreate prometheus
