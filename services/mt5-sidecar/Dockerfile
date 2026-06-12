FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    WINEARCH=win64 \
    WINEPREFIX=/root/.wine \
    WINEDEBUG=-all

RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        wget ca-certificates gnupg software-properties-common \
        xvfb xauth \
        python3 python3-pip \
    && wget -qO- https://dl.winehq.org/wine-builds/winehq.key | \
        gpg --dearmor -o /etc/apt/trusted.gpg.d/winehq.gpg \
    && echo "deb https://dl.winehq.org/wine-builds/ubuntu/ jammy main" \
        >> /etc/apt/sources.list.d/winehq.list \
    && apt-get update \
    && apt-get install -y --install-recommends winehq-stable \
    && rm -rf /var/lib/apt/lists/*

RUN xvfb-run --auto-servernum wine wineboot --init && wineserver -wait

RUN wget -q "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe" -O /tmp/py.exe && \
    xvfb-run --auto-servernum wine /tmp/py.exe /quiet InstallAllUsers=1 PrependPath=1 && \
    wineserver -wait && \
    rm /tmp/py.exe

RUN xvfb-run --auto-servernum wine python -m pip install MetaTrader5 && \
    wineserver -wait

RUN wget -q "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe" -O /tmp/mt5.exe && \
    xvfb-run --auto-servernum wine /tmp/mt5.exe /auto && \
    wineserver -wait && \
    rm /tmp/mt5.exe

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY main.py entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 8000
CMD ["./entrypoint.sh"]
