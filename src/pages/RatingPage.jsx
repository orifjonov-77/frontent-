import { useState, useEffect } from 'react';
import { ratingAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy, Star, Medal } from 'lucide-react';
import './RatingPage.css';

export default function RatingPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [teacherRating, setTeacherRating] = useState(null);
    const [myRating, setMyRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [lRes, tRes] = await Promise.all([
                ratingAPI.getLeaderboard(),
                ratingAPI.getTeacherRating()
            ]);
            setLeaderboard(lRes.data);
            setTeacherRating(tRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const rateTeacher = async (r) => {
        setMyRating(r);
        try {
            await ratingAPI.rateTeacher(r);
            const tRes = await ratingAPI.getTeacherRating();
            setTeacherRating(tRes.data);
        } catch (err) { console.error(err); }
    };

    const medals = ['🥇', '🥈', '🥉'];

    if (loading) return <div className="page-loader"><div className="spinner" /></div>;

    return (
        <div className="rating-page container animate-fade">
            <div className="page-header">
                <h1><Trophy size={28} /> Reyting</h1>
                <p>Eng yaxshi o'quvchilar reytingi</p>
            </div>

            <div className="rating-grid">
                <div className="leaderboard card">
                    <h2>O'quvchilar reytingi</h2>
                    {leaderboard.length === 0 ? (
                        <p className="empty-text">Hali reyting mavjud emas</p>
                    ) : (
                        <div className="board-list">
                            {leaderboard.map((entry, i) => (
                                <div key={entry.user_id} className={`board-row ${user?.id === entry.user_id ? 'me' : ''}`}>
                                    <div className="rank">
                                        {i < 3 ? <span className="medal">{medals[i]}</span> : <span className="rank-num">{entry.rank}</span>}
                                    </div>
                                    <div className="board-info">
                                        <strong>{entry.full_name}</strong>
                                        <span>{entry.completed_lessons} dars · {entry.test_score} test ball</span>
                                    </div>
                                    <div className="board-score">{entry.total_score}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {user && (
                    <div className="teacher-rating card">
                        <h2>O'qituvchiga baho</h2>
                        {teacherRating && (
                            <div className="avg-rating">
                                <span className="big-star">⭐</span>
                                <span className="avg-num">{teacherRating.average_rating}</span>
                                <span className="avg-count">({teacherRating.total_ratings} ta baho)</span>
                            </div>
                        )}
                        <div className="stars-row">
                            {[1, 2, 3, 4, 5].map(r => (
                                <button key={r} className={`star-btn ${myRating >= r ? 'active' : ''}`} onClick={() => rateTeacher(r)}>
                                    <Star size={28} fill={myRating >= r ? '#f59e0b' : 'none'} />
                                </button>
                            ))}
                        </div>
                        <p className="rate-hint">Baho berish uchun yulduzni bosing</p>
                    </div>
                )}
            </div>
        </div>
    );
}
