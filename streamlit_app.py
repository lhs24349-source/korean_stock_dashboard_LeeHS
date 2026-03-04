import streamlit as st
import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
import os
from dotenv import load_dotenv
import plotly.express as px
from datetime import datetime

# 설정 및 환경 변수
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

st.set_page_config(page_title="AI 수급 전략가 v2.0", layout="wide", page_icon="📈")

# 커스텀 CSS (Premium 다크 모드)
st.markdown("""
    <style>
    .main { background-color: #0f172a; color: #f8fafc; }
    .stMetric { 
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
        border: 1px solid rgba(99, 102, 241, 0.3);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    [data-testid="stMetricLabel"] { color: #94a3b8 !important; font-size: 1rem !important; font-weight: 600 !important; }
    [data-testid="stMetricValue"] { color: #ffffff !important; font-size: 2.5rem !important; font-weight: 800 !important; }
    h1 { background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .score-badge { background: linear-gradient(135deg, #6366f1, #a855f7); padding: 5px 12px; border-radius: 8px; font-weight: bold; color: white; }
    </style>
    """, unsafe_allow_html=True)

# 데이터 수합 및 분석 엔진 (Backend Logic Port)
def fetch_news(stock_name):
    try:
        url = f"https://search.naver.com/search.naver?where=news&query={stock_name}+수급"
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers)
        soup = BeautifulSoup(res.text, 'html.parser')
        news_list = []
        for i, item in enumerate(soup.select(".news_tit")):
            if i < 2:
                news_list.append({"title": item.get_text(), "link": item['href']})
        return news_list
    except:
        return []

# 외부 알림 엔진 (Telegram/Discord 독립 발송)
def send_alert(stock):
    news = fetch_news(stock['name'])
    news_text = "\n".join([f"- [{n['title']}]({n['link']})" for n in news]) if news else "관련 뉴스 없음"
    msg = f"🚀 [수급 급변 알림]\n종목명: {stock['name']}\n점수: {stock['score']}점\n주역: {stock['mainBuyer']}\n이슈: {stock['issue']}\n\n📊 뉴스:\n{news_text}"
    
    # 텔레그램 발송 (설정 있을 때만)
    if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID:
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
            requests.post(url, data={"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"}, timeout=5)
        except Exception as e:
            st.error(f"Telegram 발송 실패: {e}")
    
    # 디스코드 발송 (설정 있을 때만)
    if DISCORD_WEBHOOK_URL:
        try:
            requests.post(DISCORD_WEBHOOK_URL, json={"content": msg}, timeout=5)
        except Exception as e:
            st.error(f"Discord 발송 실패: {e}")

# 사이드바 설정
st.sidebar.title("🛠️ 시스템 설정")
st.sidebar.info("v2.0 Streamlit Cloud 최적화 버전")
auto_refresh = st.sidebar.checkbox("실시간 수급 자동 갱신 (5분)", value=True)

# 메인 헤더
st.title("AI 수급 전략가 📈")
st.caption("실시간 한국 시장 수급 질 & 뉴스 인텔리전스 (Cloud Service)")

# 시장 지수 섹션
col1, col2 = st.columns(2)
with col1:
    st.metric("KOSPI", "2,593.54", "-701.32 (-21.28%)", delta_color="inverse")
    st.markdown("""
        <div style='display: flex; gap: 15px; font-size: 0.85rem; padding: 5px 15px;'>
            <span style='color: #4ade80;'>外 +2,312억</span>
            <span style='color: #f43f5e;'>機 -5,888억</span>
            <span style='color: #94a3b8;'>個 +796억</span>
        </div>
    """, unsafe_allow_html=True)
with col2:
    st.metric("KOSDAQ", "978.44", "-159.20 (-13.99%)", delta_color="inverse")
    st.markdown("""
        <div style='display: flex; gap: 15px; font-size: 0.85rem; padding: 5px 15px;'>
            <span style='color: #4ade80;'>外 +11,715억</span>
            <span style='color: #4ade80;'>機 +250억</span>
            <span style='color: #f43f5e;'>個 -12,026억</span>
        </div>
    """, unsafe_allow_html=True)

# 수급 데이터 (시뮬레이션)
st.subheader("🔥 오늘의 수급 질 TOP 종목")
stocks_data = [
    {"name": "신세계푸드", "score": 98, "mainBuyer": "외국인", "issue": "34일 연속 순매수"},
    {"name": "에코프로비엠", "score": 95, "mainBuyer": "외국인", "issue": "숏커버링 유입"},
    {"name": "SK하이닉스", "score": 92, "mainBuyer": "기관", "issue": "저가 매수세"},
    {"name": "삼천당제약", "score": 89, "mainBuyer": "외국인", "issue": "프로그램 집중"},
    {"name": "HD현대중공업", "score": 87, "mainBuyer": "외국인", "issue": "조선주 수급 개선"}
]

df = pd.DataFrame(stocks_data)
st.table(df)

# 뉴스 매칭 및 심층 리포트
st.divider()
st.subheader("📰 프리미엄 뉴스 인사이트")
selected_stock = st.selectbox("종목 선택하여 상세 뉴스 보기", [s['name'] for s in stocks_data])

if selected_stock:
    news = fetch_news(selected_stock)
    for n in news:
        st.markdown(f"🔗 [{n['title']}]({n['link']})")

if st.button("🚨 테스트 알림 발송"):
    top_stock = stocks_data[0]
    send_alert(top_stock)
    st.success(f"{top_stock['name']} 알림 발송 완료!")

st.caption(f"Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
