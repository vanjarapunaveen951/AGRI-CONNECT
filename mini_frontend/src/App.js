import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Registration from './Registration';
import Userlogin from './Userlogin';
import Products from './Products';
import ProductForm from './ProductForm'
import ConsumerHome from './Consumerhome';
import ProducerHome from './ProducerHome';
import MyProducts from './MyProducts';
import ProductDetails from './ProductDetails';
import ProducerComments from './ProducerComments';
import Edit from './Edit';



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Registration />}/>
                <Route path="/login" element={<Userlogin />}/>
                <Route path="/consumerhome" element={<ConsumerHome />}/>
                <Route path="/products" element={<Products />}/>
                <Route path="/productform" element={<ProductForm />}/>
                <Route path='/edit/:id' element={<Edit />}/>
                <Route path='/ProducerHome' element={<ProducerHome />}/>
                <Route path='/myproducts' element={<MyProducts />}/>
                <Route path='/product/:id' element={<ProductDetails />}/>
                <Route path='/ProducerComments' element={<ProducerComments />}/>
            </Routes>
        </Router>
    );
}

export default App;
