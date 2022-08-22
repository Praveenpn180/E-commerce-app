let express = require('express');
let router = express.Router();
const userHelpers=require('../helpers/user_helper')
const twilioHelper=require("../helpers/twilio_helper");
const async = require('hbs/lib/async');
const { response } = require('express');
const { Db } = require('mongodb');
let userloggedin=false
let user=false



const verifyuserLogin=(req,res,next)=>{ 
  if(req.session.loggedIn){
   next()
  }else{
    userloggedin=false
     user=false
   res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  try{
    let category= await userHelpers.viewCategories()
    let coupon= await userHelpers.getAllCoupon()
    let Banner= await userHelpers.getBanner()
    let slider1=Banner[0]
                     let slider2=Banner[1]
                     let slider3=Banner[2]
                     let banner1=Banner[3]
                     let banner2=Banner[4]
                     let banner3=Banner[5]
   
    let totalvalue=0
    let cartProduct={}
    let cartCount=null
    let wcount=null
    if(req.session.user){
      cartCount= await userHelpers.getCartCount(req.session.user._id)
      wcount= await userHelpers.getWishlistCount(req.session.user._id)
      totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
      console.log(cartCount);
       cartProduct=await userHelpers.getCartProducts(req.session.user._id)}
      userHelpers.getAllProducts().then((products)=>{
       console.log(req.session);
      res.render('user/index',{layout:'userLayout',coupon, wcount,'user':req.session.user,userloggedin,userss:true,products,category,cartProduct,cartCount,totalvalue,
      slider1,slider2,slider3,banner1,banner2,banner3});
       
     });
  }
  catch{
    res.redirect('/login')
  }

  })
   
router.get('/login',(req,res)=>{
  try{
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
      res.render('user/login',{layout:'userLayout','loginErr':req.session.loginErr})
      req.session.loginErr=false
    }
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/signup',(req,res)=>{
  try{
    res.render('user/signup',{layout:'userLayout', "signupErr":req.session.signupErr})
  }
  catch{
    res.redirect('/')
  }
 
})

router.post('/signup',(req,res)=>{
  try{
    req.session.body=req.body
    userHelpers.checkUnique(req.body).then((response)=>{
    
     if(response.emailexist){
       req.session.signupErr='Email already exist'
       res.redirect('/signup')
       req.session.signupErr=false
     }else if(response.phoneexist){
       req.session.signupErr='Phone already exist'
       res.redirect('/signup')
       req.session.signupErr=false
     }else{
      console.log('twilio');
       twilioHelper.doSms(req.session.body).then((data)=>{
         if(data){
           res.redirect('/otp')
         }else{
           res.redirect('/signup')
         }
       })
     }
    })
  }
  catch{
    res.redirect('/')
  }

  
})

router.get('/otp',(req,res)=>{
  try{
    res.render('user/userotp',{layout:'userLayout', user:true})
  }
  catch{
    res.redirect('/')
  }
 
})
router.post('/otp',(req,res)=>{
  try{
    twilioHelper.otpVerify(req.body,req.session.body).then((response)=>{
      if(response.valid){
        userHelpers.doSignup(req.session.body).then((response)=>{
        res.redirect('/login')
      })
    }else{
      res.redirect('/otp')
    }
  })
  }
  catch{
    res.redirect('/')
  }
 
})
router.post('/login',(req,res)=>{
  try{
    userHelpers.doLogin(req.body).then((response)=>{
    
      if(response.status){
        req.session.loggedIn=true
        userloggedin=req.session.loggedIn
        req.session.user=response.user
         res.redirect('/')
      }else{
        if(response.blockStatus){
          req.session.loginErr='Access Denied'
          res.redirect('/login')
          req.session.loginErr=false
        }else{
          req.session.loginErr='Invalid Email or Password'
          res.redirect('/login')
          
        }
        
      }
    })
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/logout',(req,res)=>{
  try{
    req.session.loggedIn=false
    req.session.destroy()
    userloggedin=false;
    user=false
    res.redirect('/')
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/category/:cat',verifyuserLogin,async(req,res)=>{
  try{
    let cartProduct={}
    let cartCount=null
    let wcount=null
    let totalvalue=0
    
    let category=null
   if(req.session.user){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    cartProduct=await userHelpers.getCartProducts(req.session.user._id)}
     category=await userHelpers.viewCategories()
    wcount= await userHelpers.getWishlistCount(req.session.user._id)
    totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
    userHelpers.getProductDetails(req.params.cat).then((product)=>{
  res.render('user/blank',{layout:'userLayout', wcount,cartProduct,cartCount,totalvalue,userloggedin,userss:true,category,product ,'user':req.session.user})
  
    })
  }
  catch{
    res.redirect('/')
  }
  
 
})
router.get('/product/:id',verifyuserLogin,async(req,res)=>{
  try{
    let cartProduct={}
    let cartCount=null
    let wcount=null
    let totalvalue=0
    let product=null
    let category=null
   if(req.session.user){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    cartProduct=await userHelpers.getCartProducts(req.session.user._id)}
     category=await userHelpers.viewCategories()
    wcount= await userHelpers.getWishlistCount(req.session.user._id)
    totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
     product= await  userHelpers.getProduct(req.params.id)
      console.log(product)
      res.render('user/product',{layout:'userLayout', wcount,'user':req.session.user,product,userloggedin,userss:true,category,totalvalue,cartProduct,cartCount})
  }
  catch{
  
  }
 
  })

router.post('/add-to-cart',verifyuserLogin, (req,res)=>{
  try{
    let data={
      proId:req.body.proId,
      quantity:parseInt(req.body.numproduct)
     }
     console.log(data);
      userHelpers.addToCart(data,req.session.user._id).then(()=>{
        res.redirect('back')
      })
  }
  catch{
    res.redirect('/')
  }
   
 
})

router.get('/move-to-cart/:pro',verifyuserLogin,async(req,res)=>{
  try{
    userHelpers.addToCart(req.params.pro,req.session.user._id).then(()=>{
      userHelpers.removeWishlist(req.params.pro,req.session.user._id).then((resolve)=>{
        res.json({status:true})
      })
    })
  }
  catch{
    res.redirect('/')
  }
 
})

router.get('/add-to-wishlist/:pro',verifyuserLogin, async(req,res)=>{
  try{

    userHelpers.addToWishlist(req.params.pro,req.session.user._id).then(()=>{
      userHelpers.getWishlistCount(req.session.user._id).then((wcount)=>{
        res.json({status:true,wcount})
      })
    })
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/remove-from-wishlist/:pro',verifyuserLogin,(req,res)=>{
  try{
    userHelpers.removeWishlist(req.params.pro,req.session.user._id).then((data)=>{
     
  res.json(data)
  })
  }
  catch{
    res.redirect('/wishlist')
  }
 
})





router.get('/cart',verifyuserLogin,async(req,res)=>{
  try{
    let cartCount=0
    let cartProduct={}
    let totalvalue=0
    let wcount=null
   
      wcount= await userHelpers.getWishlistCount(req.session.user._id)
  cartCount= await userHelpers.getCartCount(req.session.user._id)
  let category= await userHelpers.viewCategories()
  
     if(cartCount>0){
      cartProduct=await userHelpers.getCartProducts(req.session.user._id)
    
        totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
   }
   res.render('user/cart',{layout:'userLayout', wcount,cartProduct,'user':req.session.user,userss:true,userloggedin,cartCount,category,totalvalue})
  }
  catch{
    res.redirect('/')
  }
 
})
router.post('/change-product-quantity',verifyuserLogin,(req,res,next)=>{
  try{
    userHelpers.changeProductQuantity(req.body).then(async(response)=>{
      response.total=await userHelpers.getTotalAmound(req.body.user)
     
   res.json(response)
    })
  }
  catch{
    res.redirect('/')
  }
  
})
router.get('/wishlist',verifyuserLogin,async(req,res)=>{
  try{

    let cartCount=null
    let cartProduct={}
    let totalvalue=null
    let wcount=0
    let wishlist=null
   
    let category= await userHelpers.viewCategories()
     wcount= await userHelpers.getWishlistCount(req.session.user._id)
     totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
   cartProduct=await userHelpers.getCartProducts(req.session.user._id)
   cartCount= await userHelpers.getCartCount(req.session.user._id)
    
    if(wcount>0){
    wishlist= await userHelpers.viewWishlist(req.session.user._id)
  
    }
    
    res.render('user/wishlist',{layout:'userLayout', wcount,'user':req.session.user,userss:true,category,userloggedin,cartCount,wishlist,cartProduct,totalvalue})
  }
  catch{
    res.redirect('/')
  }
  
})
router.get('/remove-from-cart/:proId',verifyuserLogin,(req,res)=>{
  try{
    userHelpers.removeFromCart(req.session.user._id,req.params.proId).then((response)=>{
      res.json(response)
    })
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/checkout',verifyuserLogin, async(req,res)=>{
  try{
    let cartCount=null
    let cartProduct={}
    let totalvalue=0
    let wcount=null
    let category= await userHelpers.viewCategories()
      wcount= await userHelpers.getWishlistCount(req.session.user._id)
    cartProduct=await userHelpers.getCartProducts(req.session.user._id)
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
     userHelpers.getAddress(req.session.user._id).then((address)=>{
      console.log(cartProduct);
      res.render('user/checkout',{layout:'userLayout', wcount,cartProduct,'user':req.session.user,category,userss:true,userloggedin,cartCount,totalvalue,address})
    
     })
  }
  catch{
    res.redirect('/')
  }
 
  })
router.get('/orders',verifyuserLogin,async(req,res)=>{
  try{
    let cartProduct={}
    let cartCount=null
    let wcount=null
    let totalvalue=0
    
    let category=null
    
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    cartProduct=await userHelpers.getCartProducts(req.session.user._id)
     category=await userHelpers.viewCategories()
    wcount= await userHelpers.getWishlistCount(req.session.user._id)
    totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
    let orders=await userHelpers.getUserOrders(req.session.user._id)
    res.render('user/orders',{layout:'userLayout', userss:true,user:req.session.user,orders,category,cartProduct,cartCount,wcount,totalvalue})
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/profile',verifyuserLogin,async(req,res)=>{
  try{

  }
  catch{
    res.redirect('/')
  }
  let cartProduct={}
  let cartCount=null
  let wcount=null
  let totalvalue=0
  
  let category=null
 let address=null
 address= await userHelpers.getAddress(req.session.user._id)
  cartCount= await userHelpers.getCartCount(req.session.user._id)
  cartProduct=await userHelpers.getCartProducts(req.session.user._id)
   category=await userHelpers.viewCategories()
  wcount= await userHelpers.getWishlistCount(req.session.user._id)
  totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
  res.render('user/edit-profile',{layout:'userLayout', userss:true,user:req.session.user,cartCount,cartProduct,wcount,totalvalue,category,address})
})
router.post('/place-order',verifyuserLogin,async(req,res)=>{
  try{
   
    products=await userHelpers.getCartProductslist(req.body.userId)
    totalPrice=await userHelpers.getTotalAmound(req.body.userId)
    address=await userHelpers.getDeliveryAddress(req.body.userId,req.body.address)
    console.log(req.body);
    let coupon=false
    let discount=0
   coupon=await userHelpers.getCoupon(req.body.couponCode)
  if(coupon){
    discount=(totalPrice/100)*parseInt(coupon.couponValue)
  }
   
   let totalAmount=parseInt(totalPrice-discount)*100
    userHelpers.placeOrder(req.body,products,totalPrice,address,coupon).then((orderId)=>{
  if(req.body.paymentMethod=='COD'){
    res.json({codSuccess:true})
  }else{
    userHelpers.generateRazorpay(orderId,totalAmount).then((response)=>{
      res.json(response)
     
      console.log(response);
    })
  }
     
    })
  }
  catch{
    res.redirect('/')
  }
 
 
})
router.get('/order-success',verifyuserLogin,async(req,res)=>{
  try{
    let cartProduct={}
    let cartCount=null
    let wcount=null
    let totalvalue=0
    
    let category=null
   
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    cartProduct=await userHelpers.getCartProducts(req.session.user._id)
     category=await userHelpers.viewCategories()
    wcount= await userHelpers.getWishlistCount(req.session.user._id)
    totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
    res.render('user/order-success',{layout:'userLayout',userss:true,cartCount,cartProduct,wcount,totalvalue,category })
  }
  catch{
    res.redirect('/')
  }
  
})
router.get('/view-order-products/:id/:item',verifyuserLogin,async(req,res)=>{
  try{
    let orders=await userHelpers.getOrderProducts(req.params.id,req.params.item)
    let cartProduct={}
    let cartCount=null
    let wcount=null
    let totalvalue=0
    
    let category=null
   
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    cartProduct=await userHelpers.getCartProducts(req.session.user._id)
     category=await userHelpers.viewCategories()
    wcount= await userHelpers.getWishlistCount(req.session.user._id)
    totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
    
    let Status=orders[0].products.products.orderStatus
    if(Status=="Placed"){
      orders[0].placed=true;
    }else if(Status=="Shipped"){
      orders[0].placed=true;
      orders[0].shipped=true
    }else if(Status=="Delivered"){
      orders[0].placed=true;
      orders[0].shipped=true
      orders[0].delivered=true
    }else if(Status=="Cancelled"){
     orders[0].cancelled=true
     orders[0].placed=false
     orders[0].shipped=false
     orders[0].delivered=false
    }
    
    console.log(orders[0]);
    res.render('user/view-order-products',{layout:'userLayout', user:req.session.user,orders,userss:true,cartCount,cartProduct,wcount,totalvalue,category})
  }
  catch{
    res.redirect('/')
  }
 
})
router.post('/verify-payment',verifyuserLogin,(req,res)=>{
  
  try{
    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(()=>{
  userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
   console.log('Payment success');
    res.json({status:true})
  })
    }).catch((err)=>{
     
      res.json({status:false})
    })
  }
  catch{
    res.redirect('/')
  }
 
})

router.post('/add-address',verifyuserLogin,(req,res)=>{
  try{
   
    userHelpers.addAddress(req.body.userId,req.body).then((response)=>{
    res.redirect('/checkout')
    })
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/contact',verifyuserLogin,async(req,res)=>{
  try{
    let cartProduct={}
    let cartCount=null
    let wcount=null
    let totalvalue=0
    
    let category=null
   
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    cartProduct=await userHelpers.getCartProducts(req.session.user._id)
     category=await userHelpers.viewCategories()
    wcount= await userHelpers.getWishlistCount(req.session.user._id)
    totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
    res.render("user/contact",{layout:'userLayout', user:req.session.user,userss:true,wcount,cartCount,cartProduct,category,totalvalue})
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/orderCancel/:id/:item',verifyuserLogin,(req,res)=>{
  try{
    userHelpers.orderCancel(req.params.id,req.params.item).then((response)=>{
      console.log(response);
      res.redirect('/orders')
    })
  }
  catch{
    res.redirect('/')
  }
  
})
router.post('/changeProfilePhoto',verifyuserLogin,(req,res)=>{
  try{
   
    let id=req.session.user._id
    if(req.files.profilePhoto){
      let image=req.files.profilePhoto
      image.mv('./public/profile-photos/'+id+'.jpg')
    }
    res.redirect('/profile')
  }
  catch{
    res.redirect('/profile')
  }
  
})
router.post('/userDataUpdate',verifyuserLogin,(req,res)=>{
  try{

    userHelpers.userProfileUpdate(req.session.user._id,req.body).then(()=>{

      res.redirect('/profile')
    })
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/forgot-password',(req,res)=>{
  try{
    emailError=req.session.emailError
    res.render('user/forgot-password',{layout:'userLayout',userss:true,emailError})
    req.session.emailError=null
  }
  catch{
    res.redirect('/')
  }
 
})
router.get('/resetOtp',(req,res)=>{
  try{
    let otpError= req.session.otpError
    let num=req.session.num
    res.render('user/reset-password-otp',{layout:'userLayout',num,userss:true,otpError})
    req.session.otpError=false
  }
  catch{
    res.redirect('/')
  }
 
 
})
router.post('/forgot-password',(req,res)=>{
  try{
    console.log(req.body);
    req.session.body=req.body
    let email=req.body.Email
    userHelpers.getUserDetails(email).then((data)=>{
      if(data){
        req.session.body=data
        let num=data.phone.slice(6,10)
       req.session.num=num
        twilioHelper.doSms(data).then((response)=>{
          if(response){
            res.redirect('/resetOtp')
          }else{
            req.session.otpError="OTP sending failed"
            res.redirect('/forgot-password')
          }
        })
      }else{
        req.session.emailError='Incorrect email'
        res.redirect('/forgot-password')
      }
      
    })
  }
  catch{
    res.redirect('/')
  }
 
})
router.post('/reset-otp',(req,res)=>{
  try{
    twilioHelper.otpVerify(req.body,req.session.body).then((response)=>{
      if(response.valid){
        res.render('user/new-password',{layout:'userLayout',userss:true})
       
    }else{
      req.session.otpError='INVALID OTP'
      res.redirect('/resetOtp')
    }
  })
  }
  catch{
    res.redirect('/')
  }

 
})
router.post('/resetPassword',(req,res)=>{
  try{
    userHelpers.resetPassword(req.session.body.email,req.body.Password).then((response)=>{
      console.log(response);
      res.redirect('/login')
   })
  }
  catch{
    res.redirect('/')
  }

})
router.get('/invoice/:id/:item',verifyuserLogin,async (req,res)=>{
  try{
    let orders=await userHelpers.getOrderProducts(req.params.id,req.params.item)
    res.render('user/invoice',{layout:'userLayout', orders})
  }
  catch{
    res.redirect('/')
  }
 
})
router.post('/edit-delivery-address',verifyuserLogin,(req,res)=>{
  try{
    userHelpers.editDeliveryAddress(req.body,req.session.user._id).then(()=>{
      res.redirect('/profile')
    })
  }
  catch{
    res.redirect('/')
  }
 
  
})
router.get('/apply-coupon/:cod',verifyuserLogin,(req,res)=>{
  try{
    userHelpers.getCoupon(req.params.cod).then(async(data)=>{
      totalvalue= await userHelpers.getTotalAmound(req.session.user._id)
      let discount=0
       discount=(totalvalue/100)*parseInt(data.couponValue)
      totalPrice=totalvalue-discount
     
      res.json({status:true,totalPrice,discount})
     
     })
  }
  catch{
    res.redirect('/')
  }
 

})




module.exports = router;
