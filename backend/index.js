        require('dotenv').config();
        const port = 4000;
        const express = require("express");
        const app = express();
        const mongoose = require("mongoose");
        const jwt = require("jsonwebtoken");
        const multer = require("multer");
        const path = require("path");
        const cors = require("cors");
        const nodemailer = require('nodemailer');
        const http = require('http');
        const socketIo = require('socket.io');
        const Message = require('./models/Message');

    const server = http.createServer(app);
        const io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });


        app.use(express.json());
        app.use(cors());

        //database connection
        mongoose.connect(process.env.MONGODB_URI);

        //API create
        app.get("/",(req, res) => {
            res.send("Express App is Running")
        })

        //Image Storage Engine
        const storage = multer.diskStorage({
            destination: './upload/images',
            filename:(req,file,cb)=>{
                return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
            }
        })

        const upload = multer({storage:storage})

        //Creating Upload Endpoint for Images
        app.use('/images',express.static('upload/images'))
        app.post("/upload", upload.single('product'),(req,res) => {
            res.json({
                success:1,
                image_url:`http://localhost:${port}/images/${req.file.filename}`
            })
        })

        //schema for Creating Products
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
                let products = await Product.find({});
                let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
        
                const mainImage = req.files[0] ? `http://localhost:${port}/images/${req.files[0].filename}` : '';
                const additionalImages = req.files.slice(1).map(file => `http://localhost:${port}/images/${file.filename}`);
        
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

                const product = new Product({
                    id: id,
                    name: req.body.name,
                    image: mainImage,
                    additionalImages: additionalImages,
                    detailedCategory: req.body.detailedCategory,
                    generalCategory: generalCategory,
                    size: sizes,
                    sizeStatus: defaultSizeStatus,
                    new_price: req.body.new_price,
                    old_price: req.body.old_price,
                    description: req.body.description,
                });
        
                await product.save();
                io.emit('categoriesUpdated'); 
                res.json({
                    success: true,
                    name: req.body.name,
                });
            } catch (error) {
                console.error('Error when adding products:', error);
                res.status(500).json({
                    success: false,
                    error: 'An error occurred while adding products. Please try again later.'
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
        
            // Xử lý ảnh chính 
            if (req.files['image'] && req.files['image'][0]) {
                updatedData.image = `http://localhost:${port}/images/${req.files['image'][0].filename}`;
            }
        
            // Xử lý ảnh phụ
            if (req.files['additionalImages']) {
                updatedData.additionalImages = req.files['additionalImages'].map(file => `http://localhost:${port}/images/${file.filename}`);
            }
        
            const updatedProduct = await Product.findOneAndUpdate({ id: productId }, updatedData, { new: true });
        
            if (!updatedProduct) {
                return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
            }
        
            res.json({ success: true, product: updatedProduct });
            } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi cập nhật sản phẩm' });
            }
        });

        //Creating API For deleting products
        app.post('/removeproduct',async(req,res)=>{
            await Product.findOneAndDelete({id:req.body.id});
            console.log("Removed");
            io.emit('categoriesUpdated');
            res.json({
                success: true,
                name:req.body.name
            })
        })

        //Creating API for getting all products
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
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            res.status(500).json({
                success: false,
                error: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại sau.'
            });
            }
        });

        app.get('/products/:category', async (req, res) => {
            const category = req.params.category;
            try {
            // Thực hiện truy vấn cơ sở dữ liệu để lấy sản phẩm theo category
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
        type: [String], // Lưu danh sách các size tương ứng
        default: [],
    },
});

module.exports = DetailedCategory;

// index.js
app.post("/addDetailedCategory", async (req, res) => {
    try {
        const { generalCategory, name, type } = req.body; 
        let sizes = [];

        // Xác định size mặc định dựa trên loại danh mục
        if (type === "Clothes") {
            sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        } else if (type === "Shoes") {
            sizes = ['38', '39', '40', '41', '42', '43'];
        } 
        // Nếu là Sport Equiment thì sizes sẽ là mảng rỗng (đã được set mặc định trong schema)

        const newDetailedCategory = new DetailedCategory({
            generalCategory,
            name,
            sizes, // Lưu size vào database
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
        // First, find the detailed category to get its name
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
            // Tách thông tin từ id của danh mục mặc định
            const [, generalCategory, name] = id.split('-'); 
            detailedCategory = { name, generalCategory };
        } else {
            // Nếu là danh mục từ database
            detailedCategory = await DetailedCategory.findById(id);
            if (!detailedCategory) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Detailed category not found' 
                });
            }
        }

        // Kiểm tra sản phẩm (sử dụng detailedCategory.name và detailedCategory.generalCategory)
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
                    role: 'admin' // Vai trò là 'admin'
                });
                await adminUser.save();
                console.log('Admin account created');
            }
        };

        createAdminIfNotExists();


        //Creating Endpoint for register the user
        app.post('/signup', async (req, res) => {
            try {
                // Kiểm tra xem email đã tồn tại chưa
                let check = await Users.findOne({email: req.body.email});
                if (check) {
                    return res.status(400).json({
                        success: false, 
                        errors: "Existing user found with same email address"
                    });
                }
        
                // Tạo user mới
                const user = new Users({
                    name: req.body.username,
                    email: req.body.email, 
                    password: req.body.password, // Lưu ý: Nên hash password
                    cartData: [], // Khởi tạo cartData là mảng rỗng
                    role: 'user'
                });
        
                // Lưu user
                await user.save();
        
                // Log thông tin user để kiểm tra
                console.log('User saved successfully:', user);
        
                // Tạo token
                const data = {
                    user: {
                        id: user._id, 
                        role: user.role
                    }
                };
                
                const token = jwt.sign(data, 'secret_ecom');
        
                // Trả về response
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
                        id: user.id, // Đảm bảo user.id được gửi trong response
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
        
                // Kiểm tra xem email có tồn tại không
                const user = await Users.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, error: "Account does not exist" });
                }
        
                // Tạo mã OTP ngẫu nhiên
                const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
        
                // Lưu OTP và thời gian hết hạn vào user (sử dụng thêm trường otp và otpExpiration)
                user.otp = otp;
                user.otpExpiration = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút
                await user.save();

                console.log("OTP generated:", otp); // In ra mã OTP đã tạo
                console.log("OTP expiration:", user.otpExpiration); 
        
                // Gửi email chứa OTP (sử dụng Nodemailer)
                const transporter = nodemailer.createTransport({
                    // Cấu hình dịch vụ email của bạn (Gmail, SendGrid, Mailgun, etc.)
                    service: 'gmail', 
                    auth: {
                        user: 'phamthehuy18052002@gmail.com', 
                        pass: 'nheq uxug pxii rfjn'
                    }
                });
        
                const mailOptions = {
                    from: 'phamthehuy18052002@gmail.com',
                    to: email,
                    subject: 'Sportstores Password Reset OTP',
                    text: `Your OTP for password reset is: ${otp}`
                };
        
                await transporter.sendMail(mailOptions);
        
                res.json({ success: true   
         });
            } catch (error) {
                console.error('Error in forgot-password:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });
        
        // API kiểm tra mã OTP
        app.post('/verify-otp', async (req, res) => {
            try {
                const { email, otp } = req.body;
        
                const user = await Users.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, error: "Account does not exist" });
                }
                console.log("OTP from database:", user.otp); // In ra OTP từ database
        console.log("OTP from request:", otp); // In ra OTP từ request
        console.log("Current time:", Date.now()); // In ra thời gian hiện tại
        console.log("OTP expiration time:", user.otpExpiration);
        
                // Kiểm tra OTP
                if (user.otp !== otp) {
                    return res.status(400).json({ success: false, error: "Incorrect verification code" });
                }
        
                // Kiểm tra thời hạn OTP
                if (Date.now() > user.otpExpiration) {
                    return res.status(400).json({ success: false, error: "The verification code has expired." });
                }
        
                res.json({ success: true });
                
            } catch (error) {
                console.error('Error in verify-otp:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });
        
        // API cập nhật mật khẩu
        app.post('/update-password', async (req, res) => {
            try {
                const { email, password } = req.body;

                const user = await Users.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, error: "Account does not exist" });
                }

                // Cập nhật mật khẩu (nên hash password trước khi lưu)
                user.password = password;
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
                    .sort({ date: -1 }) // Sắp xếp theo date giảm dần (mới nhất trước)
                    .limit(4); // Giới hạn 4 sản phẩm
        
                console.log("New Collection Fetched");
                res.send(newcollection);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm mới:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm mới. Vui lòng thử lại sau.' 
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
                console.error('Lỗi khi lấy danh sách sản phẩm phổ biến cho nữ:', error);
                res.status(500).json({
                    success: false,
                    error: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm phổ biến cho nữ. Vui lòng thử lại sau.'
                });
            }
        });


app.get('/product/:productName', async (req, res) => {
    try {
        const productName = req.params.productName;
        // Tìm kiếm sản phẩm dựa trên productName (hoặc slug)
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

        //creating middelware to fetch user
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

        // API lấy thông tin profile người dùng
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
                        addresses: user.addresses || []
                    }
                });
            } catch (error) {
                console.error('Error in get-profile:', error);
                res.status(500).json({ success: false, error: "Internal server error" });
            }
        });

        // API cập nhật thông tin profile
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

        // API thêm địa chỉ mới
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

        // API cập nhật địa chỉ
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

        // API xóa địa chỉ
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

        // API đặt địa chỉ mặc định
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
        
                // Chuyển đổi cartData sang định dạng phù hợp
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
                // Kiểm tra xem người dùng có phải là admin không
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ error: 'Forbidden' }); 
                }
            
                try {
                    const users = await Users.find({ role: { $in: ['user', 'staff'] } }); 
                    res.json(users);
                } catch (error) {
                    console.error('Lỗi khi lấy danh sách tài khoản:', error);
                    res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi lấy danh sách tài khoản.' });
                }
            });


            app.delete('/admin/delete-account/:userId', fetchUser, async (req, res) => {
                // Kiểm tra xem người dùng có phải là admin không
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ error: 'Forbidden' }); 
                }
            
                try {
                    const userId = req.params.userId;
                    const deletedUser = await Users.findByIdAndDelete(userId);
            
                    if (!deletedUser) {
                        return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
                    }
            
                    res.json({ success: true });
                } catch (error) {
                    console.error('Lỗi khi xóa tài khoản:', error);
                    res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi xóa tài khoản.' });
                }
            });

            app.put('/admin/update-account/:userId', fetchUser, async (req, res) => {
                // Kiểm tra xem người dùng có phải là admin không
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ error: 'Forbidden' }); 
                }
            
                try {
                    const userId = req.params.userId;
                    const { name, email, password, role } = req.body; // Lấy thông tin cập nhật từ req.body
            
                    const updatedUser = await Users.findByIdAndUpdate(
                        userId, 
                        { name, email, password, role }, 
                        { new: true }
                    );
            
                    if (!updatedUser) {
                        return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
                    }
            
                    res.json({ success: true, user: updatedUser });
                } catch (error) {
                    console.error('Lỗi khi cập nhật tài khoản:', error);
                    res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi cập nhật tài khoản.' });
                }
            });

            
        //creating endpoint to remove produt from cartdata
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
                        // Nếu số lượng là 1, loại bỏ sản phẩm khỏi giỏ hàng
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


        //Endpoin clearcart
        app.post('/clearcart', fetchUser, async (req, res) => {
            try {
                // Use findOneAndUpdate to avoid versioning conflicts
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


    // Schema cho đơn hàng
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


// Endpoint xử lý thanh toán
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

            // Kiểm tra stock trước khi checkout
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
                name: productData.name  // Thêm tên sản phẩm để dễ debug
            };
        }));

        const newOrder = new Order({
            userId: req.user.id,
            products: orderProducts,
            totalAmount,
            shippingInfo,
            paymentMethod,
            orderStatus: 'pending'
        });

        const savedOrder = await newOrder.save({ session });

        const updatedProducts = [];

        for (let product of orderProducts) {
            let updatedProduct;
            
            // Giảm stock (sử dụng transaction)
            updatedProduct = await Product.findOneAndUpdate(
                { id: product.productId },
                { $inc: { stock: -product.quantity } },
                { new: true, session }
            );

            // Tự động cập nhật sizeStatus nếu sản phẩm có size
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

            // Kiểm tra updatedProduct trước khi push
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

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Emit Socket.IO event với thông tin sản phẩm đã cập nhật
        io.emit('stockUpdated', updatedProducts);

        res.json({ 
            success: true, 
            orderId: savedOrder._id,
            updatedProducts: updatedProducts
        });

    } catch (error) {
        // Nếu có lỗi, rollback transaction
        await session.abortTransaction();
        session.endSession();

        console.error('Chi tiết lỗi:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.',
            errorDetails: error.toString()  // Thêm chi tiết lỗi để debug
        });
    }
});



    // Endpoint lấy danh sách đơn hàng của người dùng
    app.get('/get-orders', fetchUser, async (req, res) => {
        try {
            const orders = await Order.find({ userId: req.user.id }); 
            res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'An error occurred while fetching orders.'   
    });
        }
    });

    // Endpoint lấy danh sách tất cả đơn hàng (chỉ dành cho staff)
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

    // Endpoint cập nhật trạng thái đơn hàng (chỉ dành cho staff)
    app.put('/staff/update-order-status/:orderId', fetchUser, async (req, res) => {
        // Kiểm tra xem người dùng có phải là admin không
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

            // Nếu trạng thái mới là "processing" hoặc "shipped" hoặc "delivered", cập nhật số lượng tồn kho
            if (newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered') {
                order.products.forEach(async (product) => {
                    await Product.findOneAndUpdate(
                        { id: product.productId }, 
                        { $inc: { stock: -product.quantity } } // Giảm số lượng tồn kho
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

    // Endpoint tạo tài khoản mới (chỉ dành cho admin)
    app.post('/admin/create-account', fetchUser, async (req, res) => {
        // Kiểm tra xem người dùng có phải là admin không
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' }); 
        }
    
        try {
            const { name, email, password, role } = req.body;
    
            // Kiểm tra xem email đã tồn tại chưa
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
            console.log('User saved successfully'); // Log sau khi lưu
    
            res.json({ success: true });
        } catch (error) {
            console.error('Error when creating an account:', error);
            res.status(500).json({ success: false, error: 'An error occurred while creating an account. Please try again later.' });
        }
    });

    app.get('/admin/get-orders', fetchUser, async (req, res) => {
        // Kiểm tra xem người dùng có phải là nhân viên không
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' }); 
        }

        try {
            // Lấy danh sách đơn hàng mà nhân viên có thể xem (tùy thuộc vào logic nghiệp vụ của bạn)
            const orders = await Order.find({ /* ... điều kiện lọc đơn hàng ... */ }); 
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


    // Endpoint cập nhật stock và sizeStatus (chỉ dành cho staff)
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
                    return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
                }

                const resp = updatedProduct.toObject();
                if (resp.sizeStatus instanceof Map) {
                    resp.sizeStatus = Object.fromEntries(resp.sizeStatus);
                }

                io.emit('categoriesUpdated');

                res.json({ success: true, product: resp });
            } catch (error) {
                console.error('Lỗi khi cập nhật tồn kho:', error);
                res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi cập nhật tồn kho' });
            }
        });



    // Schema cho Feedback
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
        }
    });

    // API thêm feedback mới
    app.post('/add-feedback', fetchUser, async (req, res) => {
        try {
            const { productId, rating, content } = req.body;
            const userName = await Users.findById(req.user.id).select('name'); // Lấy tên người dùng

            const newFeedback = new Feedback({
                productId,
                userId: req.user.id, // Lưu trữ userId
                userName: userName.name, // Lưu trữ userName
                rating,
                content
            });

            await newFeedback.save();
            res.status(201).json(newFeedback); // Trả về feedback mới được tạo
        } catch (error) {
            console.error('Lỗi khi thêm feedback:', error);
            res.status(500).json({ success: false, error: 'Đã xảy ra lỗi khi thêm feedback.' });
        }
    });

    // API lấy danh sách feedback theo productId
    app.get('/get-feedbacks/:productId', async (req, res) => {
        try {
            const productId = req.params.productId;
            const feedbacks = await Feedback.find({ productId });
            res.json(feedbacks);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách feedback:', error);
            res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách feedback.' });
        }
    });


// API endpoint để lấy danh sách nhân viên
app.get('/api/staff-list', fetchUser, async (req, res) => {
    try {
        // Kiểm tra xem người dùng có phải là khách hàng không
        if (req.user.role !== 'user') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Lấy danh sách nhân viên từ database
        const staffList = await Users.find({ 
            role: 'staff',
            // Có thể thêm các điều kiện khác như status: 'online' nếu cần
        }, 'name _id'); // Chỉ lấy các trường cần thiết

        res.json(staffList);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách nhân viên.' });
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

        // Lưu dữ liệu vào database
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


    // Thay đổi app.listen thành server.listen
    server.listen(port, (error) => {
        if (!error) {
            console.log("Server Running on Port: " + port);
        } else {
            console.log("Error : " + error);
        }
    });
