import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import PlaceOrder from "./pages/PlaceOrder";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import VerifyMomo from "./pages/VerifyMomo";
import SearchBar from "./components/SearchBar";
import ResetPassword from "./pages/ResetPassword";
import DiscountBanner from "./components/DiscountBanner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/Verify";
import Success from "./pages/Success";
import ScrollToTop from "./components/ScrollToTop";
import ChangePassword from "./pages/ChangePassword";

const App = () => {
  return (
    <>
      <DiscountBanner />
      <Navbar />
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
