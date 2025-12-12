import { Routes, Route } from "react-router-dom";
import Contact from "./pages/Contact";
import VerifyMomo from "./pages/VerifyMomo";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/Verify";
import Success from "./pages/Success";
import ChangePassword from "./pages/ChangePassword";
import HeaderNavigation from "./components/user/navigation/HeaderNavigation";
import ScrollToTop from "./components/user/ui/ScrollToTop";
import SearchBar from "./components/user/ui/SearchBar";
import Footer from "./components/user/footer/Footer";
import {
  About,
  Cart,
  Collection,
  Home,
  PlaceOrder,
  Profile,
  Orders,
  Product,
  Login,
  NotFound,
} from "./pages/user";

const App = () => {
  return (
    <>
      <HeaderNavigation />
      <ScrollToTop />
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pb-20">
        <ToastContainer />
        <SearchBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verifyMomo" element={<VerifyMomo />} />
          <Route path="/success" element={<Success />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
