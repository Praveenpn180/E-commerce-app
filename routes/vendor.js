let express = require('express');
let router = express.Router();
let vendorHelper=require('../helpers/vendor_helpers')
const verifyvendorLogin=(req,res,next)=>{ 
  if(req.session.vendorloggedin){
   next()
  }else{
   res.redirect('/vendor')
  }
}

router.get('/', function(req, res, next) {
  if(req.session.vendorloggedin){
    res.render('vendor/vendor_index',{layout:'adminLayout',vendor,vendorloggedin});
  }else{
    res.render('vendor/vendor_login',{layout:'adminLayout','loginErr':req.session.vendorloginErr});
    req.session.vendorloginErr=false
  }
  });
  router.post('/vendorlogin',(req,res)=>{
    vendorHelper.doLogin(req.body).then((response)=>{
     console.log(response.status);
     console.log(response.blockStatus);
      if(response.status){
        req.session.vendorloggedin=true
        req.session.vendor=response.vendor
        vendorloggedin=req.session.vendorloggedin
       vendor=response.vendor
         res.redirect('/vendor')
      }else{
        if(response.blockStatus){
          
          req.session.vendorloginErr='Access Denied'
          console.log(req.session);
          res.redirect('/vendor') 
        }else{
          req.session.vendorloginErr='Invalid Email or Password'
          res.redirect('/vendor')
        }
       
      
      }
    })
  })
  router.get('/vendorlogout',(req,res)=>{
    req.session.destroy()
    vendorLoggedin=false;
    vendor=false
    res.redirect('/vendor')
  })
  

router.get('/signup', function(req, res, next) {
    res.render('vendor/vendor_signup',{layout:'adminLayout'});
  });
  router.post('/vendorsignup',(req,res)=>{
    console.log(req.body);
  vendorHelper.doSignup(req.body).then((response)=>{
     res.send('new vendor reqistration request has been send to admin, you will be able to login after approval')
  })
})
router.get('/vendor-viewproducts',verifyvendorLogin,(req,res,next)=>{
  vendorHelper.getAllProducts().then((products)=>{
    res.render('vendor/vendor-viewproducts',{layout:'adminLayout',vendor,products,vendorloggedin})
})
});
router.get('/add-product',verifyvendorLogin,(req,res)=>{
  vendorHelper.viewCategories().then((category)=>{
    res.render('vendor/vendor-addproduct',{layout:'adminLayout',vendor,vendorloggedin,category})
  })
 
}) 
router.post('/add-product',verifyvendorLogin,(req,res)=>{
vendorHelper.addProduct(req.body).then((id)=>{
  console.log(id);
  let image=req.files.Image
  console.log(image);
  image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
    if(!err){
     res.redirect('/vendor/add-product')
    }else{
      console.log(err);
    }
  })
  })
  })
router.get('/delete-product/:id',verifyvendorLogin,(req,res)=>{
let proId=req.params.id
vendorHelper.deleteProduct(proId).then((response)=>{
  res.redirect('/vendor/vendor-viewproducts')
}) 
})
router.get('/edit-product/:id',verifyvendorLogin, async(req,res)=>{
  let product=await vendorHelper.getProductDetails(req.params.id)
  vendorHelper.viewCategories().then((category)=>{
  res.render('vendor/vendor-editproduct',{layout:'adminLayout',vendor,product,category,vendorloggedin})
  })
  })
  router.post('/edit-product/:id',verifyvendorLogin,(req,res)=>{
    let id=req.params.id
    vendorHelper.updateProduct(req.params.id,req.body)
    
    if(req.files.Image){
      let image=req.files.Image
      console.log(image);
      image.mv('./public/product-images/'+id+'.jpg')
    }
    res.redirect('/vendor/vendor-viewproducts')
  })
  router.get('/addCategory',verifyvendorLogin,(req,res)=>{
    vendorHelper.viewCategories().then((category)=>{
      res.render('vendor/vendor-categoryManage',{layout:'adminLayout',vendor,vendorloggedin,category})
    })
    
  })


  router.post('/addcategory',verifyvendorLogin,(req,res)=>{
    vendorHelper.addCategory(req.body).then((response)=>{
      res.redirect('/vendor/addCategory')
    })
   
  })
  router.get('/delete-category/:id',verifyvendorLogin,(req,res)=>{
    let categoryid=req.params.id
    vendorHelper.deleteCategory(categoryid).then((response)=>{
      res.redirect('/vendor/addCategory')
    })

  })

module.exports = router