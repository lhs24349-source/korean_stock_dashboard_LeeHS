# 📈 AI 수급 전략가 v2.0 (Stock Supply/Demand Dashboard)

한국 주식 시장의 수급 질(Quality)을 실시간으로 분석하고, 주요 수급 주체(외국인/기관)의 움직임과 뉴스를 결합하여 투자 인텔리전스를 제공하는 대시보드입니다.

## 🚀 주요 기능
- **실시간 시장 대시보드**: KOSPI/KOSDAQ 지수 및 투자자별 매매대금 시각화.
- **수급 질(Quality) 분석**: 자체 알고리즘을 통한 수급 질 점수 산출 및 TOP 종목 선정.
- **AI 뉴스 엔진**: 종목별 수급 이슈와 실시간 뉴스를 자동으로 매칭.
- **통합 알림 시스템**: 수급 급변 종목 발생 시 텔레그램/디스코드 자동 알림.

## 🛠️ 기술 스택
- **Language**: Python 3.x
- **Framework**: Streamlit
- **Crawl & Analysis**: BeautifulSoup4, Requests, Pandas
- **UI/UX**: Plotly, Custom CSS

## 📋 로컬 실행 방법
1. 저장소 클론:
   ```bash
   git clone [your-repo-url]
   ```
2. 필수 라이브러리 설치:
   ```bash
   pip install -r requirements.txt
   ```
3. 실행:
   ```bash
   streamlit run streamlit_app.py
   ```

## ☁️ 클라우드 배포 (Streamlit Cloud)
이 저장소는 **Streamlit Cloud** 배포에 최적화되어 있습니다. GitHub에 푸시한 후 Streamlit Cloud 계정에서 신규 앱을 생성하고 환경 변수(`TELEGRAM_TOKEN`, `DISCORD_WEBHOOK_URL`)를 설정하면 즉시 공인 서비스로 사용 가능합니다.
