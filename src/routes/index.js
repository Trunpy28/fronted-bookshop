import HomePage from "../pages/HomePage/HomePage";
import CartPage from "../pages/CartPage/CartPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
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
import ChangePassword from "../pages/ChangePassword/ChangePassword";
import ForbiddenPage from "../pages/ForbiddenPage/ForbiddenPage";
import ShippingAddressPage from "../pages/ShippingAddress/ShippingAddressPage";
import VoucherPage from "../pages/VoucherPage/VoucherPage";
import ProductListPage from "../pages/ProductListPage/ProductListPage";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import AdminUser from "../components/AdminUser/AdminUser";
import AdminProduct from "../components/AdminProduct/AdminProduct";
import AdminOrder from "../components/AdminOrder/AdminOrder";
import AdminGenre from "../components/AdminGenre/AdminGenre";
import AdminInventory from "../components/AdminInventory/AdminInventory";
import AdminVoucher from "../components/AdminVoucher/AdminVoucher";

export const routes =  [
    { 
        path: '/',
        page: HomePage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/products',
        page: ProductListPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/cart',
        page: CartPage,
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
        path: '/details-order/:orderId',
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
        path: '/vouchers',
        page: VoucherPage,
        isShowHeader: true,
        isPrivate: false
    },
    { 
        path: '/admin',
        page: AdminPage,
        isShowHeader: false,
        isPrivate: true,
        adminManage: true,
        children: [
            {
                path: '', // Default route
                page: AdminDashboard
            },
            {
                path: 'user',
                page: AdminUser
            },
            {
                path: 'product',
                page: AdminProduct
            },
            {
                path: 'order',
                page: AdminOrder
            },
            {
                path: 'genre',
                page: AdminGenre
            },
            {
                path: 'inventory',
                page: AdminInventory
            },
            {
                path: 'voucher',
                page: AdminVoucher
            }
        ]
    },
    {
        path: "/change-password",
        page: ChangePassword,
        isShowHeader: true,
        isShowFooter: true,
        isPrivate: true,
    },
    {
        path: "/user/account/address",
        page: ShippingAddressPage,
        isShowHeader: true,
        isShowFooter: true,
        isPrivate: true,
    },
    {
        path: "/forbidden",
        page: ForbiddenPage,
    },
    { 
        path: '*',
        page: NotFoundPage
    }
]