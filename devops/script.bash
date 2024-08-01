if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://github.com/prometheus/prometheus/releases/download/v2.54.0-rc.0/prometheus-2.54.0-rc.0.linux-amd64.tar.gz
elif [[ "$OSTYPE" == "darwin"* ]]; then
        wget https://github.com/prometheus/prometheus/releases/download/v2.54.0-rc.0/prometheus-2.54.0-rc.0.darwin-amd64.tar.gz
fi

tar xvfz prometheus-*.tar.gz