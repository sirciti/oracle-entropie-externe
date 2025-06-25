#!/bin/bash
# Setup script Monitoring - Oracle d'Entropie
# Installation Netdata + Prometheus + Grafana

set -e

echo "🚀 Démarrage installation monitoring Oracle d'Entropie..."

# Mise à jour système
apt-get update -y
apt-get upgrade -y

# Installation des dépendances
apt-get install -y curl wget gnupg2 software-properties-common apt-transport-https

echo "📊 Installation Netdata..."
# Installation Netdata (solution moderne et efficace)
bash <(curl -Ss https://my-netdata.io/kickstart.sh) --stable-channel --disable-telemetry

# Configuration Netdata
cat > /etc/netdata/netdata.conf << EOF
[global]
    hostname = oracle-entropie-${environment}
    history = 86400
    update every = 1
    memory mode = dbengine
    page cache size = 32
    dbengine disk space = 1024

[web]
    web files owner = root
    web files group = netdata
    bind to = 0.0.0.0:19999
    allow connections from = *
    allow dashboard from = *
    allow badges from = *
    allow streaming from = *
    allow netdata.conf from = *

[plugins]
    python.d = yes
    node.d = yes
    apps = yes
    proc = yes
    diskspace = yes
    cgroups = yes
    tc = no
    idlejitter = yes
    checks = no
    apps.plugin = yes
    python.d.plugin = yes
    charts.d.plugin = yes
    node.d.plugin = yes
    plugins.d = yes
EOF

echo "🔥 Installation Prometheus..."
# Création utilisateur prometheus
useradd --no-create-home --shell /bin/false prometheus

# Téléchargement Prometheus
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvf prometheus-2.45.0.linux-amd64.tar.gz

# Installation Prometheus
cp prometheus-2.45.0.linux-amd64/prometheus /usr/local/bin/
cp prometheus-2.45.0.linux-amd64/promtool /usr/local/bin/
chown prometheus:prometheus /usr/local/bin/prometheus
chown prometheus:prometheus /usr/local/bin/promtool

# Création des répertoires
mkdir /etc/prometheus
mkdir /var/lib/prometheus
chown prometheus:prometheus /etc/prometheus
chown prometheus:prometheus /var/lib/prometheus

# Configuration Prometheus
cat > /etc/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'netdata'
    static_configs:
      - targets: ['localhost:19999']
    metrics_path: '/api/v1/allmetrics'
    params:
      format: ['prometheus']
  
  - job_name: 'oracle-entropie-backend'
    static_configs:
      - targets: ['10.0.2.0:8000']  # Backend privé
    scrape_interval: 5s
    metrics_path: '/metrics'
  
  - job_name: 'oracle-entropie-frontend'
    static_configs:
      - targets: ['10.0.1.0:5173']  # Frontend public
    scrape_interval: 10s
EOF

chown prometheus:prometheus /etc/prometheus/prometheus.yml

# Service Prometheus
cat > /etc/systemd/system/prometheus.service << EOF
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \\
    --config.file /etc/prometheus/prometheus.yml \\
    --storage.tsdb.path /var/lib/prometheus/ \\
    --web.console.templates=/etc/prometheus/consoles \\
    --web.console.libraries=/etc/prometheus/console_libraries \\
    --web.listen-address=0.0.0.0:9090 \\
    --web.enable-lifecycle

[Install]
WantedBy=multi-user.target
EOF

echo "📈 Installation Grafana..."
# Installation Grafana
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | tee -a /etc/apt/sources.list.d/grafana.list
apt-get update -y
apt-get install -y grafana

# Configuration Grafana
cat > /etc/grafana/grafana.ini << EOF
[server]
http_addr = 0.0.0.0
http_port = 3000
domain = localhost
root_url = http://localhost:3000/

[security]
admin_user = oracle_admin
admin_password = entropy_2025_secure

[auth.anonymous]
enabled = false

[dashboards]
default_home_dashboard_path = /var/lib/grafana/dashboards/oracle-entropie.json
EOF

# Dashboard Oracle d'Entropie personnalisé
mkdir -p /var/lib/grafana/dashboards
cat > /var/lib/grafana/dashboards/oracle-entropie.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "Oracle d'Entropie Quantique-Géométrique",
    "tags": ["oracle", "entropie", "quantum"],
    "style": "dark",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Entropie Shannon en Temps Réel",
        "type": "stat",
        "targets": [
          {
            "expr": "oracle_entropy_shannon_rate",
            "legendFormat": "Shannon Rate"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 0.7},
                {"color": "green", "value": 0.9}
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Performance Visualiseurs 3D",
        "type": "graph",
        "targets": [
          {
            "expr": "oracle_threejs_fps",
            "legendFormat": "FPS Three.js"
          }
        ]
      },
      {
        "id": 3,
        "title": "Sources d'Entropie Actives",
        "type": "stat",
        "targets": [
          {
            "expr": "oracle_entropy_sources_active",
            "legendFormat": "Sources Actives"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
EOF

echo "🔧 Démarrage des services..."
# Démarrage des services
systemctl daemon-reload
systemctl enable netdata
systemctl start netdata
systemctl enable prometheus
systemctl start prometheus
systemctl enable grafana-server
systemctl start grafana-server

# Attendre que les services démarrent
sleep 10

echo "✅ Installation monitoring terminée !"
echo "📊 Netdata: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):19999"
echo "🔥 Prometheus: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9090"
echo "📈 Grafana: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "   Login: oracle_admin / entropy_2025_secure"

# Nettoyage
rm -rf /tmp/prometheus-*
