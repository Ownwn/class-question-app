import {BrowserRouter, Route, Routes} from "react-router-dom";
import {AdminPage} from "./routes/AdminPage.tsx";
import {LoginPage} from "./routes/LoginPage.tsx";
import {MainPage} from "./routes/MainPage.tsx";
import {NotFound} from "./routes/NotFound.tsx";
import "./App.css";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/admin" element={<AdminPage/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );

}


export default App;
