import HomePage from "../pages/HomePage/HomePage";
import OrderPage from "../pages/OrderPage/OrderPage";
import ProductPage from "../pages/ProductPage/ProductPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import ProductDetailsPage from "../pages/ProductDetailsPage/ProductDetailsPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import AdminPage from "../pages/AdminPage/AdminPage";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import MyOrderPage from "../pages/MyOrder/MyOrderPage";
import DetailsOrderPage from "../pages/DetailsOrderPage/DetailsOrderPage";
import ContactPage from "../pages/ContactPage/ContactPage";
import EmailInput from "../pages/ResetPassword/EmailInput";
import OTPInput from "../pages/ResetPassword/OTPInput";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import AdminGenre from "../components/AdminGenre/AdminGenre";
import AdminInventory from "../components/AdminInventory/AdminInventory";


export const routes =  [
    { 
        path: '/',
        page: HomePage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/order',
        page: OrderPage,
        isShowHeader: true,
        isPrivate: true
    },
    { 
        path: '/my-order',
        page: MyOrderPage,
        isShowHeader: true,
        isPrivate: true
    },
    {
        path: '/details-order/:id',
        page: DetailsOrderPage,
        isShowHeader: true,
        isPrivate: true
    },
    { 
        path: '/payment',
        page: PaymentPage,
        isShowHeader: true,
        isPrivate: true
    },
    { 
        path: '/order-success',
        page: OrderSuccess,
        isShowHeader: true,
        isPrivate: true
    },
    { 
        path: '/products',
        page: ProductPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/product/:type',
        page: TypeProductPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/sign-in',
        page: SignInPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/sign-up',
        page: SignUpPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/account/recovery',
        page: EmailInput,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/account/recovery/otp/:email',
        page: OTPInput,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/account/recovery/reset-password',
        page: ResetPassword,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/product-details/:id',
        page: ProductDetailsPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/profile-user',
        page: ProfilePage,
        isShowHeader: true,
        isPrivate: true
    },
    { 
        path: '/contact',
        page: ContactPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/admin',
        page: AdminPage,
        isShowHeader: false,
        isPrivate: true,
        adminManage: true
    },
    { 
        path: '*',
        page: NotFoundPage
    }
]