const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 환경 변수 설정 (실제 토큰 입력 필요)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
let bot = null;
if (TELEGRAM_TOKEN) {
    bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });
}

// 메모리 내 저장소
let marketData = {
    kospi: { index: 5093.54, change: -701.32, foreign: 2312, institutional: -5888, private: 796 },
    kosdaq: { index: 978.44, change: -159.20, foreign: 11715, institutional: 250, private: -12026 },
    topStocks: []
};

/**
 * 실시간 뉴스 크롤링 (네이버 금융 기준)
 */
const fetchNewsForStock = async (stockName) => {
    try {
        const searchUrl = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(stockName)}+수급`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const news = [];
        $('.news_tit').each((i, el) => {
            if (i < 2) { // 상위 2개 뉴스만
                news.push({
                    title: $(el).text(),
                    link: $(el).attr('href')
                });
            }
        });
        return news;
    } catch (error) {
        console.error(`${stockName} 뉴스 크롤링 실패:`, error.message);
        return [];
    }
};

/**
 * 외부 알림 전송 (텔레그램, 디스코드)
 */
const sendExternalAlert = async (stock) => {
    const news = await fetchNewsForStock(stock.name);
    const newsText = news.length > 0
        ? news.map(n => `- [${n.title}](${n.link})`).join('\n')
        : '관련 실시간 뉴스 없음';

    const message = `🚀 [수급 급변 알림]
종목명: ${stock.name}
수급 점수: ${stock.score}점
주역: ${stock.mainBuyer}
이슈: ${stock.issue}

📊 실시간 뉴스:
${newsText}`;

    // 텔레그램 전송
    if (bot && process.env.TELEGRAM_CHAT_ID) {
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    }

    // 디스코드 전송
    if (DISCORD_WEBHOOK_URL) {
        axios.post(DISCORD_WEBHOOK_URL, { content: message }).catch(e => console.error('Discord 전송 실패:', e.message));
    }

    console.log(`[알림 발송 완료] ${stock.name} (${stock.score}점)`);
};

// 데이터 수집 및 점수 평가
const fetchMarketData = async () => {
    try {
        console.log('실시간 수급 및 뉴스 분석 중...');

        // 시뮬레이션 데이터 업데이트
        const newTopStocks = [
            { name: '신세계푸드', score: 98, mainBuyer: '외국인', issue: '34일 연속 순매수' },
            { name: '에코프로비엠', score: 95, mainBuyer: '외국인', issue: '숏커버링 유입' },
            { name: 'SK하이닉스', score: 92, mainBuyer: '기관', issue: '저가 매수세' },
            { name: '삼천당제약', score: 89, mainBuyer: '외국인', issue: '프로그램 집중' }
        ];

        // 점수 90점 이상 신규 진입 종목 감지 및 알림
        for (const stock of newTopStocks) {
            const isAlreadyTop = marketData.topStocks.find(s => s.name === stock.name && s.score >= 90);
            if (stock.score >= 90 && !isAlreadyTop) {
                await sendExternalAlert(stock);
            }
        }

        marketData.topStocks = newTopStocks;
        console.log('데이터 분석 완료.');
    } catch (error) {
        console.error('데이터 처리 중 오류:', error.message);
    }
};

cron.schedule('*/5 * * * *', fetchMarketData);

app.get('/api/market', (req, res) => res.json(marketData));

// 외부 네트워크 접속을 위해 0.0.0.0 바인딩
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 모든 네트워크 인터페이스(0.0.0.0)에서 포트 ${PORT}로 실행 중입니다.`);
    fetchMarketData();
});
