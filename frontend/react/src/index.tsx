import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from "./pages/mainPage/mainPage";
import Game from "./pages/game/Game";
import Chat from "./pages/chat/Chat";
import MyProfile from './pages/myProfile/myProfile';
import Match from "./pages/match/Match"
import Win from "./pages/endGame/win";
import Lose from "./pages/endGame/lose";
import GameOver from "./pages/endGame/GameOver";
import Profile from './pages/Profile/Profile';
import AllPlayers from './pages/allPlayers/allPlayers';
import Request from './pages/request/Request';
import EditProfilePicture from './pages/myProfile/editProfilePicture';
import NotFound from './pages/notFound/notFound';
import Tmp from './pages/tmp/tmp';
import { ModalProvider } from './context/modal-context';
import TwoFa from './pages/twoFa/twoFa';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(<>
	<ModalProvider>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/twoFa" element={<TwoFa />} />
				<Route path="/mainPage" element={<MainPage />} />
				<Route path="/game" element={<Game />} />
				<Route path="/chat" element={<Chat />} />
				<Route path="/myProfile" element={<MyProfile />} />
				<Route path="/match" element={<Match />} />
				<Route path="/endGame/lose" element={<Lose />} />
				<Route path="/endGame/win" element={<Win />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/allPlayers" element={<AllPlayers />} />
				<Route path="/endGame/gameOver" element={<GameOver />} />
				<Route path="/request" element={<Request />} />
				<Route path="/tmp" element={<Tmp />} />
				<Route path="/myProfile/editProfilePicture" element={<EditProfilePicture />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	</ModalProvider>
</>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
