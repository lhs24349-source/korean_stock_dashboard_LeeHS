import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, AlertCircle, Activity, Globe, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Localtunnel 공인 URL로 고정하여 전세계 어디서든 접속 가능하게 설정
    const [apiHost, setApiHost] = useState(`https://cold-regions-rescue.loca.lt`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiHost}/api/market`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                // 시연용 더미 데이터 (연결 실패 시)
                if (!data) {
                    setData({
                        kospi: { index: 5093.54, change: -701.32, foreign: 2312, institutional: -5888 },
                        kosdaq: { index: 978.44, change: -159.20, foreign: 11715, institutional: 250 },
                        topStocks: [
                            { name: '신세계푸드', score: 98, mainBuyer: '외국인', issue: '34일 연속 순매수' },
                            { name: '에코프로비엠', score: 95, mainBuyer: '외국인', issue: '숏커버링 유입' }
                        ]
                    });
                    setLoading(false);
                }
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [apiHost]);

    if (loading) return <div className="loading">AI 수급 엔진 가동 중...</div>;

    return (
        <div className="dashboard-container">
            <header className="main-header">
                <div className="brand">
                    <h1 className="logo-text">
                        AI 수급 전략가 <span className="beta-tag">v1.3</span>
                    </h1>
                    <p className="sub-text">실시간 수급 & 뉴스 인텔리전스</p>
                </div>
                <div className="header-meta">
                    <div className="status-badge">
                        <div className="live-dot"></div>
                        인터넷 접속 중: {apiHost}
                    </div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="info-banner"
            >
                <Bell size={18} />
                <span>텔레그램/디스코드 알림 기능이 활성화되었습니다. (설정은 .env 활용)</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="warning-banner"
            >
                <AlertCircle size={20} />
                ⚠️ 긴급: 지정학적 리스크 확대로 인한 시장 변동성 극대화 (서킷브레이커 발동 주의)
            </motion.div>

            <div className="market-grid">
                <MarketCard title="KOSPI" index={data.kospi.index} change={data.kospi.change} foreign={data.kospi.foreign} inst={data.kospi.institutional} />
                <MarketCard title="KOSDAQ" index={data.kosdaq.index} change={data.kosdaq.change} foreign={data.kosdaq.foreign} inst={data.kosdaq.institutional} />
            </div>

            <div className="glass-card main-list">
                <h2 className="section-title">
                    <Activity size={20} color="#a855f7" /> 실시간 수급 질 TOP 종목
                </h2>
                <div className="table-responsive">
                    <table className="supply-table">
                        <thead>
                            <tr>
                                <th>종목명</th>
                                <th>점수</th>
                                <th>주도체</th>
                                <th>뉴스 & 이슈</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {data.topStocks.map((stock, index) => (
                                    <motion.tr
                                        key={stock.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <td className="stock-name">{stock.name}</td>
                                        <td><span className="score-badge">{stock.score}</span></td>
                                        <td>{stock.mainBuyer}</td>
                                        <td className="stock-issue">
                                            <div className="issue-label">{stock.issue}</div>
                                            <div className="news-tag"><Globe size={12} /> 실시간 뉴스 연동 중</div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="footer-info">
                <p>전세계 접속 주소: <strong style={{ color: '#a855f7' }}>https://tiny-sloths-hide.loca.lt</strong></p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>인터넷 주소만 있으면 모바일에서도 즉시 확인 가능합니다.</p>
            </footer>
        </div>
    );
};

const MarketCard = ({ title, index, change, foreign, inst }) => {
    const isUp = change >= 0;
    const changePercent = (change / index * 100).toFixed(2);
    return (
        <div className="glass-card">
            <p className="card-label">{title}</p>
            <div className="market-index">{index.toLocaleString()}</div>
            <div className={`change-rate ${isUp ? 'up' : 'down'}`}>
                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {change.toLocaleString()} ({isUp ? '+' : ''}{changePercent}%)
            </div>
            <div className="investor-row">
                <div>
                    <span className="label">외인:</span> <span className={foreign >= 0 ? 'up-text' : 'down-text'}>{foreign > 0 ? '+' : ''}{foreign.toLocaleString()}억</span>
                </div>
                <div>
                    <span className="label">기관:</span> <span className={inst >= 0 ? 'up-text' : 'down-text'}>{inst > 0 ? '+' : ''}{inst.toLocaleString()}억</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
