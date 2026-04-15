require('dotenv').config();
const port = Number(process.env.PORT) || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require('nodemailer');
const http = require('http');
const socketIo = require('socket.io');
const fetch = require('node-fetch');
const Message = require('./models/Message');
// Cấu hình Cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Kiểm tra và log thông tin xác thực Cloudinary
console.log('Cloudinary config check:');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

    const server = http.createServer(app);
        const io = socketIo(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:5173',
                'https://sport-good-e43j.vercel.app',
                'https://sportgood.onrender.com',
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    });


        app.use(express.json());
        const corsOptions = {
    origin: function (origin, callback) {
        // Danh sách nguồn được phép
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://sport-good-e43j.vercel.app',
            'https://sportgood.onrender.com',
        ];

        // Cho phép yêu cầu không có origin (ví dụ: Postman, ứng dụng di động)
        if (!origin) {
            return callback(null, true);
        }

        // Kiểm tra origin có trong danh sách được phép không
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log origin bị chặn để debug
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'auth-token', 'Authorization', 'origin', 'Accept']
};

// Middleware CORS - Xử lý tất cả yêu cầu từ frontend Vercel
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://sport-good-e43j.vercel.app',
        'https://sportgood.onrender.com',
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, auth-token, Authorization, origin, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Xử lý yêu cầu OPTIONS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

        // Kết nối MongoDB được gọi trong startServer() (ở dưới) để Render có PORT + MONGODB_URI sẵn sàng.

        //API tạo
        app.get("/",(req, res) => {
            res.send("Express App is Running")
        })

        //Lưu trữ hình ảnh - Sử dụng Cloudinary thay vì lưu trữ cục bộ
        let storage;
        try {
            storage = new CloudinaryStorage({
                cloudinary: cloudinary,
                params: {       
                    folder: 'sportstores',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'],
                    transformation: [{ width: 800, height: 800, crop: 'limit' }],
                },
            });
            console.log('CloudinaryStorage initialized successfully');
        } catch (storageError) {
            console.error('CloudinaryStorage initialization error:', storageError);
            storage = null;
        }

        // Middleware upload - kiểm tra storage có tồn tại không
        const upload = storage
            ? multer({ storage: storage })
            : multer({ dest: './upload/images' }); // Dự phòng lưu trữ cục bộ

        if (!storage) {
            console.warn('WARNING: Cloudinary not configured. Using local storage fallback.');
        }

        //Tạo endpoint upload cho hình ảnh
        app.use('/images',express.static('upload/images'))
        app.post("/upload", upload.single('product'),(req,res) => {
            res.json({
                success:1,
                image_url: req.file.path
            })
        })

        //Schema tạo sản phẩm
        const Product = mongoose.model("Product",{
            id:{
                type: Number,
                required: true,
                unique: true,
            }, 
            name:{
                type:String,
                required: true,
            },
            image:{
                type:String,
                required: true,
            },
            additionalImages: {
                type: [String],
                default: [],
            },
            detailedCategory:{
                type:String,
                required: true,
                default: 'Club Jerseys',
            },
            generalCategory: { 
                type: String,
                required: true,
                enum: ['Men', 'Women', 'Sports Equipment'],
                default: 'Men',
            },
            size: {
                type: [String], 
                default: [] 
            },
            sizeStatus: {
                type: Map,
                of: {
                    status: { type: String, enum: ['available', 'low_stock', 'out_of_stock'], default: 'available' },
                    remainingQuantity: { type: Number, default: null }
                },
                default: {}
            },
            new_price:{
                type:Number, 
                required: true,
            },
            old_price:{
                type:Number,
                required: true,
            }, 
            description: {
                type: String,
            },
            stock: {
                type: Number,
                default: 0 
            },
            date:{
                type:Date,
                default:Date.now, 
            },
            avilable:{
                type:Boolean,
                default:true,
            }
        }) 

        app.post('/addproduct', upload.array('images', 5), async (req, res) => {
            try {
                console.log('=== addproduct endpoint called ===');
                console.log('Body:', req.body);
                console.log('Files:', req.files);
                
                let products = await Product.find({});
                let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
        
                // Kiểm tra file có tồn tại không
                if (!req.files || req.files.length === 0) {
                    console.error('No files uploaded');
                    return res.status(400).json({
                        success: false,
                        error: 'Please upload at least 1 image'
                    });
                }
        
                // Sử dụng URL Cloudinary thay vì localhost
                const mainImage = req.files[0] ? req.files[0].path : '';
                const additionalImages = req.files.slice(1).map(file => file.path);
        
                const generalCategory = req.body.generalCategory;
                const detailedCategory = req.body.detailedCategory;
                let sizes = [];
                const shoeCategories = ['Soccer Shoes', 'Basketball Shoes'];
                if (shoeCategories.includes(detailedCategory)) {
                    sizes = ['39', '40', '41', '42', '43'];
                } else if (generalCategory === 'Men' || generalCategory === 'Women') {
                    sizes = ['S', 'M', 'L', 'XL', 'XXL'];
                }
                const defaultSizeStatus = {};
                sizes.forEach(s => { defaultSizeStatus[s] = { status: 'available', remainingQuantity: null }; });

                console.log('Creating product with id:', id);
                console.log('mainImage:', mainImage);
                console.log('sizes:', sizes);

                const product = new Product({
                    id: id,
                    name: req.body.name,
                    image: mainImage,
                    additionalImages: additionalImages,
                    detailedCategory: detailedCategory,
                    generalCategory: generalCategory,
                    size: sizes,
                    sizeStatus: defaultSizeStatus,
                    new_price: req.body.new_price,
                    old_price: req.body.old_price,
                    description: req.body.description,
                });
        
                console.log('Saving product...');
                await product.save();
                console.log('Product saved successfully!');
                
                io.emit('categoriesUpdated'); 
                res.json({
                    success: true,
                    name: req.body.name,
                });
            } catch (error) {
                console.error('=== ERROR in addproduct ===');
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                console.error('Full error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message || 'An error occurred while adding products. Please try again later.'
                });
            }
        });

        app.put('/updateproduct/:id', upload.fields([
            { name: 'image', maxCount: 1 }, 
            { name: 'additionalImages', maxCount: 5 }
        ]), async (req, res) => {
            try {
            const productId = req.params.id;
            const updatedData = {
                name: req.body.name,
                detailedCategory: req.body.detailedCategory,
                generalCategory: req.body.generalCategory,
                new_price: req.body.new_price,
                old_price: req.body.old_price,
                description: req.body.description,
            };
        
        //Xử lý hình ảnh chính
            if (req.files['image'] && req.files['image'][0]) {
                updatedData.image = req.files['image'][0].path;
            }
        
            // Xử lý hình ảnh bổ sung
            if (req.files['additionalImages']) {
                updatedData.additionalImages = req.files['additionalImages'].map(file => file.path);
            }
        
            const updatedProduct = await Product.findOneAndUpdate({ id: productId }, updatedData, { new: true });

            if (!updatedProduct) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }

            res.json({ success: true, product: updatedProduct });
            } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ success: false, error: 'An error occurred while updating the product' });
            }
        });

        //Tạo API để xóa sản phẩm
        app.post('/removeproduct',async(req,res)=>{
            await Product.findOneAndDelete({id:req.body.id});
            console.log("Removed");
            io.emit('categoriesUpdated');
            res.json({
                success: true,
                name:req.body.name
            })
        })

        //Tạo API để lấy tất cả sản phẩm
        app.get('/allproducts', async (req, res) => {
            try {
            let products = await Product.find({});
            const transformed = products.map(p => {
                const obj = p.toObject();
                if (obj.sizeStatus instanceof Map) {
                    obj.sizeStatus = Object.fromEntries(obj.sizeStatus);
                }
                return obj;
            });
            console.log("All Product Fetched");
            res.send(transformed);
            } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({
                success: false,
                error: 'An error occurred while fetching products. Please try again later.'
            });
            }
        });

        app.get('/products/:category', async (req, res) => {
            const category = req.params.category;
            try {
            // Truy vấn database để lấy sản phẩm theo danh mục

            const products = await Product.find({ category }); 
            res.json(products);
            } catch (error) {
            res.status(500).json({ error: 'Internal Server Error'
        });
            }
        });


const DetailedCategory = mongoose.model("DetailedCategory", {
    name: {
        type: String,
        required: true,
        unique: true,
    },
    generalCategory: {
        type: String,
        required: true,
        enum: ['Men', 'Women', 'Sports Equipment'],
    },
            sizes: {
        type: [String], // Lưu danh sách kích thước cho mỗi danh mục
        default: [],
    },
});

module.exports = DetailedCategory;

// index.js
app.post("/addDetailedCategory", async (req, res) => {
    try {
        const { generalCategory, name, type } = req.body; 
        let sizes = [];

        //Xác định kích thước mặc định dựa trên loại danh mục
        if (type === "Clothes") {
            sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        } else if (type === "Shoes") {
            sizes = ['38', '39', '40', '41', '42', '43'];
        } 
        // Nếu Sports Equipment - sizes sẽ rỗng (đã đặt là mặc định trong schema)

        const newDetailedCategory = new DetailedCategory({
            generalCategory,
            name,
                    sizes, // Lưu sizes vào database

        });

        await newDetailedCategory.save();
        res.json({ success: true, message: "Detailed category added successfully" });
    } catch (error) {
        console.error("Error adding detailed category:", error);
        res.status(500).json({ success: false, error: "Failed to add detailed category" });
    }
});

app.get("/getDetailedCategories", async (req, res) => {
    try {
        const categories = await DetailedCategory.find();
        const categoriesWithProductCount = await Promise.all(
            categories.map(async category => {
                const productCount = await Product.countDocuments({ 
                    detailedCategory: category.name,
                    generalCategory: category.generalCategory 
                });
                return { ...category.toObject(), productCount }; 
            })
        );
        res.json({ success: true, categories: categoriesWithProductCount });
    } catch (error) {
        console.error("Error fetching detailed categories:", error);
        res.status(500).json({ success: false, error: "Failed to fetch detailed categories" });
    }
});


app.delete('/deleteDetailedCategory/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Trước tiên, tìm danh mục chi tiết để lấy tên
        const detailedCategory = await DetailedCategory.findById(id);
        
        if (!detailedCategory) {
            return res.status(404).json({ 
                success: false, 
                error: 'Detailed category not found' 
            });
        }

        // Check if any products exist with this detailed category
        const existingProducts = await Product.find({ 
            detailedCategory: detailedCategory.name,
            generalCategory: detailedCategory.generalCategory
        });

        // If products exist, prevent deletion
        if (existingProducts.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete category. Products exist with this category.',
                productCount: existingProducts.length
            });
        }

        // If no products exist, proceed with deletion
        await DetailedCategory.findByIdAndDelete(id);
        
        res.json({ 
            success: true, 
            message: 'Detailed category deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting detailed category:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error deleting detailed category' 
        });
    }
});

app.get('/checkProductsInCategory/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let detailedCategory;

        // Nếu là danh mục mặc định

        if (id.startsWith('default')) {
            // Split info from default category id
            const [, generalCategory, name] = id.split('-'); 
            detailedCategory = { name, generalCategory };
        } else {
            // If database category

            detailedCategory = await DetailedCategory.findById(id);
            if (!detailedCategory) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Detailed category not found' 
                });
            }
        }

        // Check product using detailedCategory.name and detailedCategory.generalCategory

        const existingProducts = await Product.find({ 
            detailedCategory: detailedCategory.name,
            generalCategory: detailedCategory.generalCategory
        });

        res.json({ 
            hasProducts: existingProducts.length > 0,
            productCount: existingProducts.length
        });

    } catch (error) {
        console.error('Error checking products in category:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error checking products' 
        });
    }
});

app.get('/getProductsByCategory', async (req, res) => {
    try {
      const category = req.query.category;
      const products = await Product.find({ generalCategory: category }); 
      res.json({ success: true, products });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
  });

        
        //Schema creating for User Model
        const userSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                unique: true,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                default: ''
            },
            role: {
                type: String,
                default: 'user',
                enum: ['user', 'admin', 'staff']
            },
            cartData: [{
                productId: {
                    type: String,
                    required: true
                },
                size: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 0
                }
            }],
            addresses: [{
                _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                label: { type: String, default: 'Home' },
                fullName: { type: String, default: '' },
                phone: { type: String, default: '' },
                addressLine: { type: String, default: '' },
                city: { type: String, default: '' },
                province: { type: String, default: '' },
                postalCode: { type: String, default: '' },
                isDefault: { type: Boolean, default: false }
            }],
            date: {
                type: Date,
                default: Date.now
            },
            otp: {
                type: String
            },
            otpExpiration: {
                type: Date
            },
            wishlist: [{
                productId: {
                    type: Number,
                    required: true
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                }
            }],
            passwordChangedAt: {
                type: Date,
                default: null
            }
        });
        const Users = mongoose.model('Users', userSchema);
        

        const createAdminIfNotExists = async () => {
            const adminEmail = 'admin@gmail.com';
            const adminPassword = 'admin123';
            const admin = await Users.findOne({ email: adminEmail });

            if (!admin) {
                const adminUser = new Users({
                    name: 'Admin',
                    email: adminEmail,
                    password: adminPassword,
                    role: 'admin' // Role is 'admin'
                });
                await adminUser.save();
                console.log('Admin account created');
            }
        };

        createAdminIfNotExists();


        //Creating Endpoint for register the user
        app.post('/signup', async (req, res) => {
            try {
                // Kiểm tra email đã tồn tại chưa
                let check = await Users.findOne({email: req.body.email});
                if (check) {
                    return res.status(400).json({
                        success: false, 
                        errors: "Existing user found with same email address"
                    });
                }
        
                // Create new user
                const user = new Users({
                    name: req.body.username,
                    email: req.body.email,
                    password: req.body.password, // Note: Password should be hashed
                    cartData: [], // Initialize cartData as empty array
                    role: 'user'
                });
        
                // Save user
                await user.save();
        
                // Log user info for verification
                console.log('User saved successfully:', user);
        
                // Create token
                const data = {
                    user: {
                        id: user._id, 
                        role: user.role
                    }
                };
                
                const token = jwt.sign(data, 'secret_ecom');
        
                // Return response
                res.json({
                    success: true,
                    token,
                    role: user.role,
                    user: data.user, 
                    name: user.name
                });
        
            } catch (error) {
                console.error('Error in signup:', error);
                res.status(500).json({
                    success: false, 
                    errors: "Internal server error",
                    details: error.message
                });
            }
        });



        //creating endpoint for user login
        app.post('/login', async (req, res) => {
            try {
                let user = await Users.findOne({ email: req.body.email });
                if (!user) {
                    return res.status(400).json({ success: false, errors: "Wrong email" });
                }
                const passCompare = req.body.password === user.password;
                if (!passCompare) {
                    return res.status(400).json({ success: false, errors: "Wrong password" });
                }
                const data = {
                    user: {
                        id: user.id, // Ensure user.id is sent in response

                        role: user.role
                    },
                    cartData: user.cartData
                }
                const token = jwt.sign(data, 'secret_ecom');
                res.json({ 
                    success: true, 
                    token, 
                    role: data.user.role,
                    name: user.name,
                    user: data.user,
                    cartData: data.cartData
                });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ success: false, errors: "Internal server error" });
            }
        });

        app.post('/forgot-password', async (req, res) => {
            try {
                const { email } = req.body;

                if (!email) {
                    return res.status(400).json({ success: false, error: "Email is required" });
                }

                const user = await Users.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, error: "Account does not exist" });
                }

                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = otp;
                user.otpExpiration = Date.now() + 5 * 60 * 1000;
                await user.save();

                console.log("OTP generated:", otp);

                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'phamthehuy18052002@gmail.com',
                            pass: 'nheq uxug pxii rfjn'
                        },
                        timeout: 10000
                    });

                    await transporter.sendMail({
                        from: 'phamthehuy18052002@gmail.com',
                        to: email,
                        subject: 'Sportstores Password Reset OTP',
                        text: `Your OTP for password reset is: ${otp}`
                    });
                    console.log("Email sent successfully");
                } catch (emailError) {
                    console.error("Email send failed (OTP still saved):", emailError.message);
                }

                res.json({ success: true, message: "OTP sent to your email" });
            } catch (error) {
                console.error('Error in forgot-password:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });
        
        // API to verify OTP code
        app.post('/verify-otp', async (req, res) => {
            try {
                const { email, otp } = req.body;
        
                const user = await Users.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, error: "Account does not exist" });
                }
                console.log("OTP from database:", user.otp);
        console.log("OTP from request:", otp);
        console.log("Current time:", Date.now());
        console.log("OTP expiration time:", user.otpExpiration);

                // Verify OTP
                if (user.otp !== otp) {
                    return res.status(400).json({ success: false, error: "Incorrect verification code" });
                }
        
                // Verify OTP expiration
                if (Date.now() > user.otpExpiration) {
                    return res.status(400).json({ success: false, error: "The verification code has expired." });
                }

                res.json({ success: true });
                
            } catch (error) {
                console.error('Error in verify-otp:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });
        
        // API to update password
        app.post('/update-password', async (req, res) => {
            try {
                const { email, password } = req.body;

                const user = await Users.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, error: "Account does not exist" });
                }

                // Update password and set passwordChangedAt
                user.password = password;
                user.passwordChangedAt = new Date();
                await user.save();

                res.json({ success: true });
            } catch (error) {
                console.error('Error in update-password:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        //creating endpoint for newcollection data
        app.get('/newcollections', async (req,res)=>{
            try {
                let newcollection = await Product.find({})
                    .sort({ date: -1 }) // Sort by date descending (newest first)
                    .limit(4); // Limit to 4 products
        
                console.log("New Collection Fetched");
                res.send(newcollection);
            } catch (error) {
                console.error('Error fetching new products:', error);
                res.status(500).json({
                    success: false,
                    error: 'An error occurred while fetching new products. Please try again later.'
                });
            }
        });

        //creating endpoint for popular in women section
        app.get('/popularinwomen', async (req, res) => {
            try {
                let popular_in_women = await Product.find({ generalCategory: "Women" })
                    .sort({ date: -1 }) 
                    .limit(4);
        
                console.log("Popular in women fetch");
                res.send(popular_in_women);
            } catch (error) {
                console.error('Error fetching popular products for women:', error);
                res.status(500).json({
                    success: false,
                    error: 'An error occurred while fetching popular products for women. Please try again later.'
                });
            }
        });


app.get('/product/:productName', async (req, res) => {
    try {
        const productName = req.params.productName;
        // Search for products based on productName (or slug)

        const product = await Product.findOne({ name: productName }); 
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'An error occurred while fetching the product.' });
    }
});

        //Tạo middleware để lấy thông tin người dùng
        const fetchUser = async (req, res, next)=>{
            const token = req.header('auth-token');
            if(!token){
                res.status(401).send({errors:"Please authenticate using value token "})
            }
            else{
                try {
                    const data = jwt.verify(token,'secret_ecom');
                    req.user = data.user;
                    next();
                } catch (error) {
                    res.status(401).send({errors:"Please authenticate using a value token"})
                }
            }
        }

        // API để lấy thông tin người dùng

        app.get('/get-profile', fetchUser, async (req, res) => {
            try {
                const user = await Users.findById(req.user.id).select('-cartData -otp -otpExpiration');
                if (!user) {
                    return res.status(404).json({ success: false, error: "User not found" });
                }
                res.json({
                    success: true,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || '',
                        addresses: user.addresses || [],
                        passwordChangedAt: user.passwordChangedAt || null
                    }
                });
            } catch (error) {
                console.error('Error in get-profile:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        // API để cập nhật thông tin người dùng

        app.put('/update-profile', fetchUser, async (req, res) => {
            try {
                const { name, phone } = req.body;

                const updatedUser = await Users.findByIdAndUpdate(
                    req.user.id,
                    { name, phone },
                    { new: true }
                ).select('-cartData -otp -otpExpiration');

                if (!updatedUser) {
                    return res.status(404).json({ success: false, error: "User not found" });
                }

                res.json({
                    success: true,
                    user: {
                        id: updatedUser._id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        phone: updatedUser.phone || ''
                    }
                });
            } catch (error) {
                console.error('Error in update-profile:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        // API để thêm địa chỉ mới

        app.post('/add-address', fetchUser, async (req, res) => {
            try {
                const { label, fullName, phone, addressLine, city, province, postalCode, isDefault } = req.body;

                const user = await Users.findById(req.user.id);
                if (!user) {
                    return res.status(404).json({ success: false, error: "User not found" });
                }

                if (isDefault) {
                    user.addresses.forEach(addr => { addr.isDefault = false; });
                }

                user.addresses.push({
                    label: label || 'Home',
                    fullName,
                    phone,
                    addressLine,
                    city,
                    province,
                    postalCode,
                    isDefault: isDefault || user.addresses.length === 0
                });

                await user.save();

                res.json({ success: true, addresses: user.addresses });
            } catch (error) {
                console.error('Error in add-address:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        // API để cập nhật địa chỉ

        app.put('/update-address/:addressId', fetchUser, async (req, res) => {
            try {
                const { addressId } = req.params;
                const { label, fullName, phone, addressLine, city, province, postalCode, isDefault } = req.body;

                const user = await Users.findById(req.user.id);
                if (!user) {
                    return res.status(404).json({ success: false, error: "User not found" });
                }

                const addressIndex = user.addresses.findIndex(
                    addr => addr._id.toString() === addressId
                );

                if (addressIndex === -1) {
                    return res.status(404).json({ success: false, error: "Address not found" });
                }

                if (isDefault) {
                    user.addresses.forEach(addr => { addr.isDefault = false; });
                }

                user.addresses[addressIndex].set({
                    label: label || user.addresses[addressIndex].label,
                    fullName,
                    phone,
                    addressLine,
                    city,
                    province,
                    postalCode,
                    isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault
                });

                await user.save();

                res.json({ success: true, addresses: user.addresses });
            } catch (error) {
                console.error('Error in update-address:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        // API để xóa địa chỉ
        app.delete('/delete-address/:addressId', fetchUser, async (req, res) => {
            try {
                const { addressId } = req.params;

                const user = await Users.findById(req.user.id);
                if (!user) {
                    return res.status(404).json({ success: false, error: "User not found" });
                }

                const addressIndex = user.addresses.findIndex(
                    addr => addr._id.toString() === addressId
                );

                if (addressIndex === -1) {
                    return res.status(404).json({ success: false, error: "Address not found" });
                }

                const wasDefault = user.addresses[addressIndex].isDefault;
                user.addresses.splice(addressIndex, 1);

                if (wasDefault && user.addresses.length > 0) {
                    user.addresses[0].isDefault = true;
                }

                await user.save();

                res.json({ success: true, addresses: user.addresses });
            } catch (error) {
                console.error('Error in delete-address:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        // API để đặt địa chỉ mặc định
        app.put('/set-default-address/:addressId', fetchUser, async (req, res) => {
            try {
                const { addressId } = req.params;

                const user = await Users.findById(req.user.id);
                if (!user) {
                    return res.status(404).json({ success: false, error: "User not found" });
                }

                const addressExists = user.addresses.some(
                    addr => addr._id.toString() === addressId
                );

                if (!addressExists) {
                    return res.status(404).json({ success: false, error: "Address not found" });
                }

                user.addresses.forEach(addr => {
                    addr.isDefault = addr._id.toString() === addressId;
                });

                await user.save();

                res.json({ success: true, addresses: user.addresses });
            } catch (error) {
                console.error('Error in set-default-address:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        //creating endpoint for adding products in cartdata
        app.post('/addtocart', fetchUser, async (req, res) => {
            try {
                const { itemId, selectedSize } = req.body;
                const userData = await Users.findOne({ _id: req.user.id });
        
                const existingCartItem = userData.cartData.find(
                    item => item.productId === itemId && item.size === selectedSize
                );
        
                if (existingCartItem) {
                    existingCartItem.quantity += 1;
                } else {
                    userData.cartData.push({
                        productId: itemId,
                        size: selectedSize,
                        quantity: 1,
                    });
                }
        
                await userData.save();
                res.json({ success: true, message: 'Added to cart successfully' });
            } catch (error) {
                console.error('Error adding to cart:', error);
                res.status(500).json({ success: false, error: 'Error adding product to cart' });
            }
        });
        
        
        

        app.get('/getcart', fetchUser, async (req, res) => {
            try {
                let userData = await Users.findOne({ _id: req.user.id });
        
                if (!userData) {
                    return res.status(404).json({ error: 'User not found' });
                }
        
                // Convert cartData to appropriate format
                const cartData = {};
                userData.cartData.forEach(item => {
                    if (!cartData[item.productId]) {
                        cartData[item.productId] = {};
                    }
                    cartData[item.productId][item.size] = item.quantity;
                });
        
                res.json(cartData); 
            } catch (error) {
                console.error('Error fetching cart:', error);
                res.status(500).json({ error: 'An error occurred while fetching the cart.' });
            }
        });

// Endpoint cập nhật giỏ hàng
app.put('/updatecart', fetchUser, async (req, res) => {
    try {
        const { cart } = req.body; 
        const user = await Users.findOneAndUpdate(
            { _id: req.user.id }, 
            { 
                $set: { 
                    cartData: Object.keys(cart).flatMap(productId => 
                        Object.keys(cart[productId]).map(size => ({
                            productId: productId, 
                            size: size, 
                            quantity: cart[productId][size] 
                        }))
                    ) 
                } 
            }, 
            { new: true, runValidators: true } 
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'An error occurred while updating the cart.' });
    }
});


            app.get('/admin/get-users', fetchUser, async (req, res) => {
                // Kiểm tra người dùng có phải là admin không
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ error: 'Forbidden' });
                }

                try {
                    const users = await Users.find({ role: { $in: ['user', 'staff'] } });
                    res.json(users);
                } catch (error) {
                    console.error('Error fetching account list:', error);
                    res.status(500).json({ success: false, error: 'An error occurred while fetching the account list.' });
                }
            });


            app.delete('/admin/delete-account/:userId', fetchUser, async (req, res) => {
                // Kiểm tra người dùng có phải là admin không
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ error: 'Forbidden' });
                }

                try {
                    const userId = req.params.userId;
                    const deletedUser = await Users.findByIdAndDelete(userId);

                    if (!deletedUser) {
                        return res.status(404).json({ error: 'Account not found' });
                    }

                    res.json({ success: true });
                } catch (error) {
                    console.error('Error deleting account:', error);
                    res.status(500).json({ success: false, error: 'An error occurred while deleting the account.' });
                }
            });

            app.put('/admin/update-account/:userId', fetchUser, async (req, res) => {
                // Kiểm tra người dùng có phải là admin không
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ error: 'Forbidden' });
                }

                try {
                    const userId = req.params.userId;
                    const { name, email, password, role } = req.body;

                    const updatedUser = await Users.findByIdAndUpdate(
                        userId,
                        { name, email, password, role },
                        { new: true }
                    );

                    if (!updatedUser) {
                        return res.status(404).json({ error: 'Account not found' });
                    }

                    res.json({ success: true, user: updatedUser });
                } catch (error) {
                    console.error('Error updating account:', error);
                    res.status(500).json({ success: false, error: 'An error occurred while updating the account.' });
                }
            });

            
        //creating endpoint để xóa sản phẩm khỏi cartdata
        app.post('/removefromcart', fetchUser, async (req, res) => {
            try {
                const { itemId, selectedSize } = req.body;
                let userData = await Users.findOne({ _id: req.user.id });
        
                // Tìm và giảm số lượng sản phẩm
                const cartItem = userData.cartData.find(
                    item => item.productId === itemId && item.size === selectedSize
                );
        
                if (cartItem) {
                    if (cartItem.quantity > 1) {
                        cartItem.quantity -= 1;
                    } else {
                        // Nếu số lượng là 1, xóa sản phẩm khỏi giỏ hàng
                        userData.cartData = userData.cartData.filter(
                            item => !(item.productId === itemId && item.size === selectedSize)
                        );
                    }   
        
                    await userData.save();
                }
        
                res.json({ success: true, message: 'Removed from cart' }); 
            } catch (error) {
                console.error('Error removing from cart:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'An error occurred while removing from cart.',
                    details: error.message
                });
            }
        });


        //Endpoint xóa giỏ hàng
        app.post('/clearcart', fetchUser, async (req, res) => {
            try {
                // Sử dụng findOneAndUpdate để tránh xung đột versioning
                const user = await Users.findOneAndUpdate(
                    { _id: req.user.id },
                    { $set: { cartData: [] } },
                    { new: true, runValidators: true }
                );
        
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
        
                res.json({ success: true, message: 'Cart cleared successfully' });
            } catch (error) {
                console.error('Error clearing cart:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'An error occurred while clearing the cart.',
                    details: error.message
                });
            }
        });


    // Schema đơn hàng
    const Order = mongoose.model("Order", {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users', 
            required: true
        },
        products: [{
            productId: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: { 
                type: Number,
                required: true
            },
            size: { 
                type: String,
                required: false
            }
        }],
        totalAmount: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            default: 0
        },
        shippingCost: {
            type: Number,
            default: 0
        },
        shippingInfo: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, required: true }
        },
        paymentMethod:   
    {
            type: String,
            enum: ['card','googlePay', 'bank', 'cod'], 
            required: true
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
            default: 'pending'
        },
        date: {
            type: Date,
            default: Date.now
        }
    });


// Endpoint thanh toán
app.post('/checkout', fetchUser, async (req, res) => {
    const session = await mongoose.startSession(); 
    session.startTransaction();

    try {
        const { products, shippingInfo, paymentMethod } = req.body;

        let totalAmount = 0;
        const orderProducts = await Promise.all(products.map(async product => {
            // Thay đổi tìm kiếm sản phẩm
            const productData = await Product.findOne({ id: product.productId }).lean();

            // Kiểm tra productData trước khi sử dụng
            if (!productData) {
                throw new Error(`Product with ID ${product.productId} not found`);
            }

            // Kiểm tra tồn kho trước khi thanh toán
            if (productData.generalCategory === 'Sports Equipment') {
                if (productData.stock < product.quantity) {
                    throw new Error(`Insufficient stock for Sports Equipment: ${productData.name}`);
                }
            }

            totalAmount += productData.new_price * product.quantity;
            return {
                productId: product.productId,
                quantity: product.quantity,
                price: productData.new_price,
                size: product.size,
                name: productData.name  // Thêm tên sản phẩm để debug dễ hơn
            };
        }));

        const shippingCost = totalAmount >= 100 ? 0 : 15;
        const grandTotal = totalAmount + shippingCost;

        const newOrder = new Order({
            userId: req.user.id,
            products: orderProducts,
            totalAmount: grandTotal,
            subtotal: totalAmount,
            shippingCost,
            shippingInfo,
            paymentMethod,
            orderStatus: 'pending'
        });

        const savedOrder = await newOrder.save({ session });

        const updatedProducts = [];

        for (let product of orderProducts) {
            let updatedProduct;
            
            // Giảm tồn kho (sử dụng transaction)
            updatedProduct = await Product.findOneAndUpdate(
                { id: product.productId },
                { $inc: { stock: -product.quantity } },
                { new: true, session }
            );

            // Tự động cập nhật sizeStatus nếu sản phẩm có kích thước
            if (product.size && product.size !== 'default' && updatedProduct.sizeStatus instanceof Map) {
                const ss = updatedProduct.sizeStatus.get(product.size);
                if (ss && ss.remainingQuantity !== null) {
                    const newQty = Math.max(0, ss.remainingQuantity - product.quantity);
                    const newStatus = newQty === 0 ? 'out_of_stock' : 'low_stock';
                    await Product.findOneAndUpdate(
                        { id: product.productId },
                        { $set: { [`sizeStatus.${product.size}.remainingQuantity`]: newQty, [`sizeStatus.${product.size}.status`]: newStatus } },
                        { session }
                    );
                    updatedProduct.sizeStatus.set(product.size, { ...ss, remainingQuantity: newQty, status: newStatus });
                }
            }

            // Kiểm tra updatedProduct trước khi thêm vào
            if (!updatedProduct) {
                throw new Error(`Failed to update product: ${product.name}`);
            }

            updatedProducts.push({
                id: updatedProduct.id,
                stock: updatedProduct.stock,
                sizeStatus: Object.fromEntries(updatedProduct.sizeStatus || new Map()),
                generalCategory: updatedProduct.generalCategory,
                name: updatedProduct.name
            });
        }

        // Cam kết transaction
        await session.commitTransaction();
        session.endSession();

        // Gửi sự kiện Socket.IO với thông tin sản phẩm đã cập nhật
        io.emit('stockUpdated', updatedProducts);

        res.json({
            success: true,
            orderId: savedOrder._id,
            updatedProducts: updatedProducts
        });

    } catch (error) {
        // Khi có lỗi, rollback transaction
        await session.abortTransaction();
        session.endSession();

        console.error('Error details:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during checkout. Please try again later.',
            errorDetails: error.toString()
        });
    }
});



// ============================================================
// API DANH SÁCH YÊU THÍCH
// ============================================================

// Thêm sản phẩm vào danh sách yêu thích
app.post('/wishlist/add', fetchUser, async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Kiểm tra sản phẩm đã có trong danh sách yêu thích chưa
        const exists = user.wishlist.some(item => item.productId === Number(productId));
        if (exists) {
            return res.status(400).json({ success: false, error: 'Product already in wishlist' });
        }

        user.wishlist.push({ productId: Number(productId) });
        await user.save();

        res.json({ success: true, message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Xóa sản phẩm khỏi danh sách yêu thích
app.post('/wishlist/remove', fetchUser, async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.wishlist = user.wishlist.filter(item => item.productId !== Number(productId));
        await user.save();

        res.json({ success: true, message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Lấy danh sách yêu thích (chỉ trả về productId)
app.get('/wishlist', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Lấy danh sách yêu thích kèm thông tin sản phẩm đầy đủ
app.get('/wishlist/full', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const productIds = user.wishlist.map(item => item.productId);
        const products = await Product.find({ id: { $in: productIds } });

// Sắp xếp theo thứ tự trong danh sách yêu thích
        const productMap = Object.fromEntries(products.map(p => [p.id, p]));
        const wishlistProducts = user.wishlist
            .map(item => productMap[item.productId])
            .filter(Boolean);

        res.json({ success: true, products: wishlistProducts });
    } catch (error) {
        console.error('Error fetching wishlist with products:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Kiểm tra sản phẩm có trong danh sách yêu thích không
app.get('/wishlist/check/:productId', fetchUser, async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const exists = user.wishlist.some(item => item.productId === Number(productId));
        res.json({ success: true, inWishlist: exists });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Xóa toàn bộ danh sách yêu thích
app.delete('/wishlist/clear', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.wishlist = [];
        await user.save();

        res.json({ success: true, message: 'Wishlist cleared' });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});



// ============================================================
// ENDPOINTS: LỊCH SỬ ĐƠN HÀNG / GET-ORDERS (hiện có)
// ============================================================

    // Endpoint để lấy đơn hàng của người dùng
    app.get('/get-orders', fetchUser, async (req, res) => {
        try {
            const orders = await Order.find({ userId: req.user.id });
            res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'An error occurred while fetching orders.'   });
        }
    });

    // Endpoint để lấy tất cả đơn hàng (chỉ nhân viên)
    app.get('/staff/get-all-orders', fetchUser, async (req, res) => {
        console.log('User role:', req.user.role);
        if (req.user.role !== 'staff') {
            return res.status(403).json({ error: 'Forbidden' }); 
        }

        try {
            const orders = await Order.find({}); 
            res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error:   
    'An error occurred while fetching orders.'   
    });
        }
    });

    // Endpoint để cập nhật trạng thái đơn hàng (chỉ nhân viên)
    app.put('/staff/update-order-status/:orderId', fetchUser, async (req, res) => {
        // Check if user is staff
        if (req.user.role !== 'staff') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        try {
            const orderId = req.params.orderId;
            const { newStatus } = req.body;

            // Lấy thông tin đơn hàng
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Nếu trạng thái mới là "processing" hoặc "shipped" hoặc "delivered", cập nhật tồn kho
            if (newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered') {
                order.products.forEach(async (product) => {
                    await Product.findOneAndUpdate(
                        { id: product.productId },
                        { $inc: { stock: -product.quantity } } // Reduce inventory
                    );
                });
            }

            // Cập nhật trạng thái đơn hàng
            order.orderStatus = newStatus;
            await order.save();

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: 'An error occurred while updating the order status.' });
        }
    });

    // Endpoint để tạo tài khoản mới (chỉ admin)
    app.post('/admin/create-account', fetchUser, async (req, res) => {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        try {
            const { name, email, password, role } = req.body;

            // Check if email already exists
            let check = await Users.findOne({ email });
            if (check) {
                return res.status(400).json({ success: false, error: "Email already exists" });
            }
    
            const newUser = new Users({
                name,
                email,
                password,
                cartData: [], 
                role 
            });
    
            await newUser.save().catch(error => {
                console.error('Error saving user:', error);
                return res.status(500).json({ success: false, error: 'Error when creating an account' });
            });
            console.log('User saved successfully');

            res.json({ success: true });
        } catch (error) {
            console.error('Error when creating an account:', error);
            res.status(500).json({ success: false, error: 'An error occurred while creating an account. Please try again later.' });
        }
    });

    app.get('/admin/get-orders', fetchUser, async (req, res) => {
        // Check if user is staff
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        try {
            // Get order list (customize filter conditions as needed)
            const orders = await Order.find({ /* ... order filter conditions ... */ });
            res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'An error occurred while fetching orders.'   
    });
        }
    });

    app.get('/get-order/:orderId', fetchUser, async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(order); 
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ error: 'An error occurred while fetching the order.' });
        }
    });


    // Endpoint để cập nhật tồn kho và sizeStatus (chỉ nhân viên)
    app.put('/updatestock/:id', async (req, res) => {
            try {
                const productId = req.params.id;
                const { stock, sizeStatus } = req.body;

                const updateFields = {};
                if (stock !== undefined) updateFields.stock = stock;
                if (sizeStatus !== undefined) updateFields.sizeStatus = sizeStatus;

                const updatedProduct = await Product.findOneAndUpdate(
                    { id: productId },
                    { $set: updateFields },
                    { new: true }
                );

                if (!updatedProduct) {
                    return res.status(404).json({ success: false, error: 'Product not found' });
                }

                const resp = updatedProduct.toObject();
                if (resp.sizeStatus instanceof Map) {
                    resp.sizeStatus = Object.fromEntries(resp.sizeStatus);
                }

                io.emit('categoriesUpdated');

                res.json({ success: true, product: resp });
            } catch (error) {
                console.error('Error updating stock:', error);
                res.status(500).json({ success: false, error: 'An error occurred while updating stock' });
            }
        });



    // Feedback schema (isVisible field added for admin moderation)
    const Feedback = mongoose.model("Feedback", {
        productId: {
            type: Number,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        isVisible: { type: Boolean, default: true }  // Admin can hide spam/inappropriate reviews
    });

    // API to add new feedback
    app.post('/add-feedback', fetchUser, async (req, res) => {
        try {
            const { productId, rating, content } = req.body;
            const userName = await Users.findById(req.user.id).select('name'); // Get user name

            const newFeedback = new Feedback({
                productId,
                userId: req.user.id,
                userName: userName.name,
                rating,
                content,
                isVisible: true  // New feedback is visible by default
            });

            await newFeedback.save();
            res.status(201).json(newFeedback); // Return newly created feedback
        } catch (error) {
            console.error('Error adding feedback:', error);
            res.status(500).json({ success: false, error: 'An error occurred while adding feedback.' });
        }
    });

    // API to get feedbacks by productId (only shows approved reviews)
    app.get('/get-feedbacks/:productId', async (req, res) => {
        try {
            const productId = req.params.productId;
            const feedbacks = await Feedback.find({ productId, isVisible: true }).sort({ date: -1 });
            res.json(feedbacks);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            res.status(500).json({ error: 'An error occurred while fetching feedbacks.' });
        }
    });


// ============================================================
// ADMIN: LOW STOCK & REVIEW MODERATION
// ============================================================

// Get all products with low stock (low_stock or out_of_stock)
const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD, 10) || 5;

app.get('/api/admin/low-stock-alerts', fetchUser, async (req, res) => {
    try {
        if (req.user.role === 'user') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const products = await Product.find({}, 'id name image detailedCategory generalCategory sizeStatus stock').lean();

        const alerts = [];
        for (const p of products) {
            // Check sizeStatus (clothes/shoes)
            if (p.sizeStatus && p.sizeStatus instanceof Map) {
                const ss = p.sizeStatus.toObject();
                for (const [size, info] of Object.entries(ss)) {
                    if (info.status === 'low_stock' || info.status === 'out_of_stock') {
                        alerts.push({
                            productId: p.id,
                            productName: p.name,
                            image: p.image,
                            category: p.detailedCategory,
                            generalCategory: p.generalCategory,
                            size,
                            status: info.status,
                            remainingQuantity: info.remainingQuantity ?? 0,
                            type: 'size'
                        });
                    }
                }
            }

            // Check total stock (sports equipment)
            if (p.generalCategory === 'Sports Equipment' && typeof p.stock === 'number') {
                if (p.stock <= LOW_STOCK_THRESHOLD) {
                    alerts.push({
                        productId: p.id,
                        productName: p.name,
                        image: p.image,
                        category: p.detailedCategory,
                        generalCategory: p.generalCategory,
                        size: 'Total',
                        status: p.stock === 0 ? 'out_of_stock' : 'low_stock',
                        remainingQuantity: p.stock,
                        type: 'total'
                    });
                }
            }
        }

        // Sort: out_of_stock first, then low_stock, by quantity ascending
        alerts.sort((a, b) => {
            if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1;
            if (a.status !== 'out_of_stock' && b.status === 'out_of_stock') return 1;
            return a.remainingQuantity - b.remainingQuantity;
        });

        res.json({ alerts, total: alerts.length, threshold: LOW_STOCK_THRESHOLD });
    } catch (error) {
        console.error('Error fetching low-stock alerts:', error);
        res.status(500).json({ error: 'An error occurred while fetching low-stock alerts.' });
    }
});

// Get all reviews (admin) - with product info
app.get('/api/admin/reviews', fetchUser, async (req, res) => {
    try {
        if (req.user.role === 'user') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { visible } = req.query; // ?visible=true or ?visible=false for filter

        const filter = {};
        if (visible === 'true') filter.isVisible = true;
        else if (visible === 'false') filter.isVisible = false;

        const reviews = await Feedback.find(filter)
            .sort({ date: -1 })
            .lean();

        // Lookup product name for each review
        const productIds = [...new Set(reviews.map(r => r.productId))];
        const products = await Product.find({ id: { $in: productIds } }, 'id name image').lean();
        const productMap = Object.fromEntries(products.map(p => [p.id, p]));

        const enriched = reviews.map(r => ({
            ...r,
            productName: productMap[r.productId]?.name || 'N/A',
            productImage: productMap[r.productId]?.image || ''
        }));

        res.json(enriched);
    } catch (error) {
        console.error('Error fetching reviews (admin):', error);
        res.status(500).json({ error: 'An error occurred while fetching the review list.' });
    }
});

// Toggle visible/hide a review
app.put('/api/admin/reviews/:id/toggle-visibility', fetchUser, async (req, res) => {
    try {
        if (req.user.role === 'user') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const review = await Feedback.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found.' });

        review.isVisible = !review.isVisible;
        await review.save();

        res.json({ success: true, isVisible: review.isVisible, reviewId: review._id });
    } catch (error) {
        console.error('Error toggling review visibility:', error);
        res.status(500).json({ error: 'An error occurred while updating the review status.' });
    }
});

// Delete a review (admin)
app.delete('/api/admin/reviews/:id', fetchUser, async (req, res) => {
    try {
        if (req.user.role === 'user') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const deleted = await Feedback.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Review not found.' });

        res.json({ success: true, deletedId: req.params.id });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'An error occurred while deleting the review.' });
    }
});

// API endpoint to get staff list
app.get('/api/staff-list', fetchUser, async (req, res) => {
    try {
        // Check if user is a customer
        if (req.user.role !== 'user') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Get staff list from database
        const staffList = await Users.find({
            role: 'staff',
            // Can add other conditions like status: 'online' if needed
        }, 'name _id'); // Only get necessary fields

        res.json(staffList);
    } catch (error) {
        console.error('Error fetching staff list:', error);
        res.status(500).json({ error: 'An error occurred while fetching the staff list.' });
    }
});


// Schema for Contact Form
const ContactForm = mongoose.model("ContactForm", {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// API endpoint to handle contact form submission
app.post('/submit-contact-form', async (req, res) => {
    try {
        const { name, email, subject, message, from } = req.body;

        // Save data to database
        const contactForm = new ContactForm({
            name,
            email,
            subject,
            message
        });

        await contactForm.save();
        console.log('Contact form saved to database');

        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: 'phamthehuy18052002@gmail.com', 
                pass: 'nheq uxug pxii rfjn'
            }
        });


        const userMailOptions = {
            from: 'phamthehuy18052002@gmail.com',
            to: email,
            subject: 'Confirm contact submission',
            text: `Hello!! ${name},\n\nThank you for contacting us. We have received your information and will respond as soon as possible.\n\nBest regards,\nSportstores`
        };

        await transporter.sendMail(userMailOptions);


        const adminMailOptions = {
            from: 'phamthehuy18052002@gmail.com',
            to: 'finalproject1805@gmail.com', 
            subject: 'New contact from customer',
            replyTo: from,
            text: `You have a new contact from ${name} (${email}):\n\nSubject: ${subject}\n\nMessage: ${message}`
        };

        await transporter.sendMail(adminMailOptions);

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving contact form or sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to save contact form or send email' });
    }
});

// ==========================================
// AI CHATBOT - OLLAMA INTEGRATION
// ==========================================

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';
const OLLAMA_TEMPERATURE = parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.7;

// Groq API — free tier, no GPU needed, works in production cloud
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.1-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt for chatbot - optimized for 7B model
const getSystemPrompt = (products, language = 'vi') => {
    // Group products by category for easier AI search
    const byCategory = {};
    products.forEach(p => {
        const cat = p.detailedCategory || 'Other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
    });

    const formatPrice = (n) => n ? '$' + n.toFixed(2) : 'N/A';

    let productLines = [];
    Object.keys(byCategory).forEach(cat => {
        productLines.push(`\n[${cat}]`);
        byCategory[cat].forEach(p => {
            const sizes = Array.isArray(p.size) && p.size.length ? p.size.join(', ') : 'N/A';
            const desc = p.description ? ` - ${p.description.substring(0, 80)}` : '';
            productLines.push(`  • ${p.name} | Price: ${formatPrice(p.new_price)} (old: ${formatPrice(p.old_price)}) | Size: ${sizes}${desc}`);
        });
    });

    const productContext = productLines.join('\n');

    if (language === 'en') {
        return `<instructions>
You are an expert sales assistant at "Sportstores", a Vietnamese online sports retail store.
- Products: Men's/Women's sportswear, soccer/basketball shoes, gym equipment, running shoes, sports accessories
- Payment: Credit Card, Google Pay, Bank Transfer, COD (Cash on Delivery)
- Shipping: Nationwide delivery
- Return: 7-day return policy for unused items

PRODUCT CATALOG:\n${productContext}

IMPORTANT RULES:
1. If a product exists in the catalog above → answer confidently using real data (name, price, size, description)
2. If a product does NOT exist in the catalog → say: "Sorry, that product is currently not available in our store. You can try searching for other products or contact our hotline for assistance."
3. NEVER make up or invent product information that isn't in the catalog
4. Keep answers SHORT: 1-3 sentences for simple questions, 4-5 sentences for product recommendations
5. For price questions → show formatted price with $
6. If user wants to buy → guide them to add to cart on the website
7. Be enthusiastic and helpful
8. Always respond in English when user writes in English</instructions>`;
    } else {
        return `<instructions>
You are an expert sales assistant at "Sportstores", a Vietnamese online sports retail store.
- Products: Men's/Women's sportswear, soccer/basketball shoes, gym equipment, running shoes, sports accessories
- Payment: Credit Card, Google Pay, Bank Transfer, COD (Cash on Delivery)
- Shipping: Nationwide delivery
- Return: 7-day return policy for unused items

PRODUCT CATALOG:\n${productContext}

IMPORTANT RULES:
1. If a product exists in the catalog above → answer confidently using real data
2. If a product does NOT exist → say: "Sorry, that product is currently not available. Try searching for other products or contact our hotline."
3. NEVER invent product information
4. Keep answers SHORT
5. For price questions → show formatted price with $
6. Be enthusiastic and helpful
7. Always respond in Vietnamese when user writes in Vietnamese</instructions>`;
    }
};

// Language detection function from message
const detectLanguage = (message) => {
    if (!message) return 'vi';
    const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/i;
    return vietnamesePattern.test(message) ? 'vi' : 'en';
};

// Chatbot: previously only .limit(50) without sort → many products (e.g. "AAAA") never entered context.
const CHAT_PRODUCT_FIELDS = 'name new_price old_price detailedCategory generalCategory size description';
const CHAT_MAX_PRODUCTS = parseInt(process.env.CHAT_MAX_PRODUCTS, 10) || 500;

const CHAT_STOP_WORDS = new Set([
    'thông', 'tin', 'về', 'sản', 'phẩm', 'cửa', 'hàng', 'bạn', 'cho', 'tôi', 'và', 'có', 'gì', 'là', 'một', 'của', 'này', 'đó', 'các', 'những', 'giá', 'bao', 'nhiêu',
    'some', 'any', 'the', 'a', 'an', 'is', 'are', 'what', 'how', 'tell', 'me', 'about', 'product', 'products', 'info', 'information', 'please', 'want', 'need', 'show', 'list', 'all', 'shop', 'store'
]);

function escapeRegexChat(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractChatKeywords(text) {
    const matches = String(text).match(/[\p{L}\p{N}]{2,}/gu);
    if (!matches) return [];
    const out = new Set();
    for (const m of matches) {
        const low = m.toLowerCase();
        if (!CHAT_STOP_WORDS.has(low)) out.add(low);
    }
    return [...out];
}

/** Always sort by id; prioritize products with name matching keywords in the question. */
async function loadProductsForChatbot(userMessage) {
    const tokens = extractChatKeywords(userMessage);
    let matched = [];
    if (tokens.length > 0) {
        const orConds = tokens.map(t => ({ name: new RegExp(escapeRegexChat(t), 'i') }));
        matched = await Product.find({ $or: orConds }, CHAT_PRODUCT_FIELDS).sort({ id: 1 }).lean();
    }
    const matchedIds = matched.map(p => p.id);
    const remainingLimit = Math.max(0, CHAT_MAX_PRODUCTS - matched.length);
    let rest = [];
    if (remainingLimit > 0) {
        const query = matchedIds.length ? { id: { $nin: matchedIds } } : {};
        rest = await Product.find(query, CHAT_PRODUCT_FIELDS).sort({ id: 1 }).limit(remainingLimit).lean();
    }
    const products = [...matched, ...rest];
    console.log(`[ChatBot] Context: ${products.length} products (name-matched: ${matched.length}; keywords: ${tokens.join(', ') || 'none'})`);
    return products;
}

// Quick check: open GET http://localhost:4000/api/chat/health in browser
app.get('/api/chat/health', (req, res) => {
    res.json({
        ok: true,
        chatPostPath: '/api/chat',
        ollamaUrl: OLLAMA_URL,
        model: OLLAMA_MODEL
    });
});

// API Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const products = await loadProductsForChatbot(message);

        // Determine language and create corresponding system prompt
        const language = detectLanguage(message);
        const systemPrompt = getSystemPrompt(products, language);

        // Build messages array for Ollama (correct order: system -> history -> user)
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
        ];

        // Log prompt size for debug
        console.log(`[ChatBot] Using model: ${OLLAMA_MODEL} | Prompt chars: ${systemPrompt.length} | History: ${history.length} msgs`);

// === Use Groq if API key is available ===
        if (GROQ_API_KEY) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: messages,
                    temperature: OLLAMA_TEMPERATURE,
                    max_tokens: 512
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API Error:', errorText);
                return res.status(500).json({
                    error: 'AI service error. Please try again.',
                    details: errorText
                });
            }

            const data = await response.json();
            reply = data.choices?.[0]?.message?.content?.trim() || '';
        } else {
            // === Fallback to local Ollama ===
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);

            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: OLLAMA_TEMPERATURE,
                        top_p: 0.9,
                        num_predict: 512
                    }
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ollama API Error:', errorText);
                return res.status(500).json({
                    error: 'AI service unavailable. Please check Ollama is running with the correct model.',
                    details: errorText
                });
            }

            const data = await response.json();
            reply = data.message?.content?.trim() || '';
        }

        res.json({ response: reply || 'Sorry, I cannot respond at this time.', language });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Chat API Error: Request timeout');
            return res.status(504).json({
                error: 'AI response took too long. Please try again.',
                details: 'Timeout'
            });
        }
        console.error('Chat API Error:', error);
        res.status(500).json({
            error: 'Chat service error. Please try again.',
            details: error.message
        });
    }
});

// API to get product info for chatbot context (debug / sync with shop)
app.get('/api/chat/products', async (req, res) => {
    try {
        const products = await Product.find({}, CHAT_PRODUCT_FIELDS).sort({ id: 1 }).limit(CHAT_MAX_PRODUCTS).lean();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


// ============ GLOBAL ERROR HANDLER ============
// Handle all unhandled errors above
// Handle all unhandled errors above

app.use((err, req, res, next) => {
    console.error('=== GLOBAL ERROR HANDLER ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Request path:', req.path);
    console.error('Request method:', req.method);
    
    // Handle Multer errors (file upload)
    if (err.name === 'MulterError') {
        console.error('MulterError code:', err.code);
        console.error('MulterError message:', err.message);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Please choose a smaller file.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum 5 files allowed.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Invalid field name. Use "images" as the field name.'
            });
        }

        return res.status(400).json({
            success: false,
            error: 'File upload error: ' + err.message
        });
    }

    // Handle Cloudinary errors
    if (err.message && err.message.includes('cloudinary')) {
        console.error('Cloudinary error details:', err);
        return res.status(500).json({
            success: false,
            error: 'Cloudinary error: ' + err.message
        });
    }
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler - handle routes not found
app.use((req, res) => {
    console.log('404 - Route not found:', req.method, req.path);
    res.status(404).json({
        success: false,
        error: 'Route not found: ' + req.path
    });
});


async function startServer() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('Missing MONGODB_URI. On Render: Environment → Add → MONGODB_URI = your MongoDB Atlas connection string.');
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected.');
        server.listen(port, () => {
            console.log('Server Running on Port: ' + port);
            console.log('Chatbot: POST .../api/chat | Health: GET .../api/chat/health');
        });
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

startServer();
