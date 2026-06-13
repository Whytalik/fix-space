FROM --platform=linux/amd64 ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    WINEARCH=win64 \
    WINEPREFIX=/root/.wine \
    WINEDEBUG=-all \
    WINEDLLOVERRIDES="mscoree,mshtml="

RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        wget ca-certificates gnupg software-properties-common \
        xvfb xauth procps \
        python3 python3-pip \
    && wget -qO- https://dl.winehq.org/wine-builds/winehq.key | \
        gpg --dearmor -o /etc/apt/trusted.gpg.d/winehq.gpg \
    && echo "deb https://dl.winehq.org/wine-builds/ubuntu/ jammy main" \
        >> /etc/apt/sources.list.d/winehq.list \
    && apt-get update \
    && apt-get install -y --install-recommends \
        winehq-stable=9.0.0.0~jammy-1 \
        wine-stable=9.0.0.0~jammy-1 \
        wine-stable-amd64=9.0.0.0~jammy-1 \
        wine-stable-i386=9.0.0.0~jammy-1 \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /opt/wine-stable/bin/wine64 /usr/bin/wine

RUN wget -q "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe" -O /tmp/py.exe && \
    wget -q "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe" -O /tmp/mt5.exe

RUN xvfb-run --auto-servernum sh -c " \
    export WINEDEBUG=-all; \
    echo 'Initializing Wine...' && \
    timeout 300s wine64 wineboot --init && wineserver -w; \
    echo 'Setting Windows 10 version and disabling crash dialogs...' && \
    wine64 reg add 'HKEY_CURRENT_USER\\Software\\Wine' /v Version /t REG_SZ /d 'win10' /f && \
    wine64 reg add 'HKEY_CURRENT_USER\\Software\\Wine\\WineDbg' /v ShowCrashDialog /t REG_DWORD /d 0 /f && \
    wineserver -w; \
    echo 'Installing Python for Windows...' && \
    wine64 /tmp/py.exe /quiet InstallAllUsers=1 PrependPath=1 && wineserver -w; \
    echo 'Installing MetaTrader5 Python package...' && \
    wine64 python -m pip install MetaTrader5 && wineserver -w; \
    echo 'Installing MetaTrader5 Terminal...' && \
    wine64 /tmp/mt5.exe /auto && wineserver -w" && \
    rm /tmp/py.exe /tmp/mt5.exe

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY main.py entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 8000
CMD ["./entrypoint.sh"]
