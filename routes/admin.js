let express = require('express');
const async = require('hbs/lib/async');
const { Code } = require('mongodb');
const { totalSale, totalOrder, onlinePaymentCount } = require('../helpers/admin_helper');
//const { response } = require('../app');
let router = express.Router();
let adminHelper=require('../helpers/admin_helper');
const vendor_helpers = require('../helpers/vendor_helpers');

const verifyAdminLogin=(req,res,next)=>{ 
  try{
    if(req.session.adminLoggedin){
      next()
     }else{
      res.redirect('/admin')
     }
  }
  catch(err){
   res.redirect('/admin')
  }
  
}
/* GET users listing. */


router.get('/', function(req, res) {
  try{
    if(req.session.adminLoggedin){
      res.redirect('/admin/admindashboard')
      }else{
        res.render('admin/admin_login',{layout:'adminLayout','adminloginerr':req.session.adminloginErr});
        req.session.adminLoggErr=false
      }
      
  }
  catch(err){
   res.redirect('/admin')
  }
  
});
router.get('/admindashboard',verifyAdminLogin,async(req,res)=>{
   try{
    const allData = await Promise.all
    ([
      
      adminHelper.totalUsers(),
      adminHelper.totalSale(),
      adminHelper.totalOrder(),
      adminHelper.onlinePaymentCount(),
      adminHelper.totalCOD(),
      adminHelper.totalPending(),
      adminHelper.totalPlaced(),
      adminHelper.totalShipped(),
      adminHelper.totalDelivered(),
      adminHelper.totalCancelled(),
      
    ]);
   let totalRevenue=allData[1]*20/100
    

    res.render('admin/admin_index' ,{layout:'adminLayout',adminLoggedin,dashboard:true,
    totalUser:allData[0],
    totalSale:allData[1],
    totalOrder:allData[2],
    onlinePayment:allData[3],
    cashOnDelivery:allData[4],
    pending :allData[5],
    placed:allData[6],
    shipped:allData[7],
    delivered:allData[8],
    cancelled:allData[9],
    totalRevenue
  })
   }
   catch(err){
    res.redirect('/admin')
   }
})

router.post('/adminlogin',(req,res)=>{
try{
  adminHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedin=true
      adminLoggedin=req.session.adminLoggedin
      req.session.admin=response.admin
      console.log(req.session);
      res.redirect('/admin/admindashboard');
      
    }else{
      req.session.adminloginErr=true
      res.redirect('/admin')
      req.session.adminloginErr=false
    }
  })
}
catch(err){
  res.redirect('/admin')
}
})
router.get('/adminlogout',(req,res)=>{
  try{
    req.session.destroy()
    adminLoggedin=false;
    res.redirect('/admin')
  }
  catch(err){
    res.redirect('/admin')
  }
 
})
router.get('/vendors',verifyAdminLogin,(req,res)=>{
  try{
    adminHelper.vendorlist().then((data)=>{
      console.log(data);
      res.render('admin/admin-vendorlist',{layout:'adminLayout',adminLoggedin,'vendorrequest':data.vendorrequest,'vendors':data.vendors})
    })
  }
  catch(err){
    res.redirect('/admin')
  }
  
  
})
router.get('/users',verifyAdminLogin,(req,res)=>{
  try{
    adminHelper.userlist().then((users)=>{
      res.render('admin/admin-userlist',{layout:'adminLayout',adminLoggedin,users})
    })
  }
  catch(err){
    res.redirect('/admin')
  }
  
  
})
router.get('/admin-viewproducts',verifyAdminLogin,(req,res,next)=>{
  try{
    adminHelper.getAllProducts().then((products)=>{
      
      res.render('admin/admin-viewproducts',{layout:'adminLayout',admin:true,products,adminLoggedin:true})
})
  }
  catch(err){
    res.redirect('/admin')
  }
  
});
router.get('/add-product',verifyAdminLogin,(req,res)=>{
  try{
    adminHelper.viewCategories().then((category)=>{
      res.render('admin/admin-addproduct',{layout:'adminLayout',admin:true,adminLoggedin:true,category})
    })
  }
  catch(err){
    res.redirect('/admin')
  }
 
})
    
router.post('/add-product',verifyAdminLogin,(req,res)=>{
  try{
    adminHelper.addProduct(req.body).then((id)=>{
      console.log(id);
      let image=req.files.Image
      console.log(image);
      image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
        if(!err){
         res.redirect('/admin/add-product')
        }else{
          console.log(err);
        }
      })
      })
  }
  catch(err){
    res.redirect('/admin')
  }
  
    })
router.get('/delete-product/:id',verifyAdminLogin,(req,res)=>{
  try{
    let proId=req.params.id
    adminHelper.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/admin-viewproducts')
    })
  }
  catch(err){
    res.redirect('/admin')
  }
   
  })
  router.get('/edit-product/:id',verifyAdminLogin, async(req,res)=>{
    try{
      let product=await adminHelper.getProductDetails(req.params.id)
      adminHelper.viewCategories().then((category)=>{
      res.render('admin/admin-editproduct',{layout:'adminLayout',product,adminLoggedin,category})
     })
    }
    catch(err){
      res.redirect('/admin')
    }

    })
    

    
    router.post('/edit-product/:id',verifyAdminLogin,(req,res)=>{
      try{
        let id=req.params.id
        adminHelper.updateProduct(req.params.id,req.body)
        res.redirect('/admin/admin-viewproducts')
        if(req.files.Image){
          let image=req.files.Image
          image.mv('./public/product-images/'+id+'.jpg')
        }
      }
      catch(err){
        res.redirect('/admin')
      }
     
    })
    router.get('/Block-user/:id',verifyAdminLogin,(req,res)=>{
      try{
        adminHelper.blockUser(req.params.id) .then((response)=>{
          console.log(response);
          res.redirect('/admin/users')
        } )
      }
      catch(err){
        res.redirect('/admin')
      }
    
    })
    router.get('/unBlock-user/:id',verifyAdminLogin,(req,res)=>{
      try{
        adminHelper.unblockUser(req.params.id) .then((response)=>{
          res.redirect('/admin/users')
        } )
      }
      catch(err){
        res.redirect('/admin')
      }
      
      })
      router.get('/delete-user/:id',verifyAdminLogin,(req,res)=>{
        try{
          let userid=req.params.id
          adminHelper.deleteuser(userid).then((response)=>{
            res.redirect('/admin/users')
          }) 
        }
        catch(err){
          res.redirect('/admin')
        }
       
        })
      router.get('/Block-vendor/:id',verifyAdminLogin,(req,res)=>{
        try{
          adminHelper.blockVendor(req.params.id) .then((response)=>{
            console.log(response);
            res.redirect('/admin/vendors')
          } )
        }
        catch(err){
          res.redirect('/admin')
        }
       
        })
        router.get('/unBlock-vendor/:id',verifyAdminLogin,(req,res)=>{
          try{
            adminHelper.unblockVendor(req.params.id) .then((response)=>{
              res.redirect('/admin/vendors')
            } )
          }
          catch(err){
            res.redirect('/admin')
          }
          
          })
          router.get('/delete-vendor/:id',verifyAdminLogin,(req,res)=>{
            try{
              let vendorid=req.params.id
              adminHelper.deleteVendor(vendorid).then((response)=>{
                res.redirect('/admin/vendors')
              })
            }
            catch(err){
              res.redirect('/admin')
            }
             
            })

            router.get('/addCategory',verifyAdminLogin,(req,res)=>{
              try{
                adminHelper.viewCategories().then((categoryy)=>{
                  res.render('admin/admin-categoryManage',{layout:'adminLayout',adminLoggedin,categoryy})
                })
              }
              catch(err){
                res.redirect('/admin')
              }
               
                
              })


              router.post('/addcategory',verifyAdminLogin,(req,res)=>{
                try{
                  adminHelper.addCategory(req.body).then((response)=>{
                    res.redirect('/admin/addCategory')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
               
              })
              router.get('/delete-category/:id',verifyAdminLogin,(req,res)=>{
                try{
                  let categoryid=req.params.id
                  adminHelper.deleteCategory(categoryid).then((response)=>{
                    res.redirect('/admin/addCategory')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
            
              })
              router.get('/approve-vendor/:id',verifyAdminLogin,(req,res)=>{
                try{
                  vendorid=req.params.id
                  adminHelper.approvevendor(vendorid).then((response)=>{
                    res.redirect('/admin/vendors')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
              })
              router.get('/reject-vendor/:id',verifyAdminLogin,(req,res)=>{
                try{
                  vendorid=req.params.id
                  adminHelper.rejectvendor(vendorid).then((response)=>{
                    res.redirect('/admin/vendors')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
              })
              router.get('/orders',verifyAdminLogin,(req,res)=>{
                try{
                  adminHelper.getOrders().then((orders)=>{
                 
                    for(let i=0;i<orders.length;i++){
                      if(orders[i].products.products.orderStatus=='Placed'){
                        orders[i].placed=true
                      }else if(orders[i].products.products.orderStatus=='Shipped'){
                        orders[i].placed=false
                        orders[i].shipped=true
                      }else if(orders[i].products.products.orderStatus=='Delivered'){
                        orders[i].placed=false
                        orders[i].shipped=false
                        orders[i].delivered=true
                      }
                    }
                   
                      console.log(orders);
                    res.render('admin/admin-viewOrders',{layout:'adminLayout',adminLoggedin,orders})
                    })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
               
                })
              
             
              router.get('/bannerManage',verifyAdminLogin,async(req,res)=>{
                try{
                 let category=await adminHelper.viewCategories()
                  adminHelper.getBanner().then((Banner)=>{
                    let slider1=Banner[0]
                    let slider2=Banner[1]
                    let slider3=Banner[2]
                    let banner1=Banner[3]
                    let banner2=Banner[4]
                    let banner3=Banner[5]
                    res.render("admin/admin-bannerManage",{layout:'adminLayout',adminLoggedin,slider1,slider2,slider3,banner1,banner2,banner3,category,banner:true})
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
                
             
              })
              router.post('/updateBanner',verifyAdminLogin,(req,res)=>{
                try{
                  adminHelper.updateBanner(req.body).then(()=>{
                    res.redirect('/admin/bannerManage')
                    let image=req.files.Image
                    image.mv('./public/banner-images/'+req.body.Name+'.jpg')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }

               
              })
              router.get('/orderShipped/:odr/:item',verifyAdminLogin,(req,res)=>{
                try{
                  let data='Shipped'
                  adminHelper.orderStatusUpdate(req.params.odr,req.params.item,data).then((response)=>{
                    res.redirect('/admin/orders')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
              })
              router.get('/orderDelivered/:odr/:item',verifyAdminLogin,(req,res)=>{
                try{
                  let data='Delivered'
                  adminHelper.orderStatusUpdate(req.params.odr,req.params.item,data).then((response)=>{
                    res.redirect('/admin/orders')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
                
               })
               router.get('/orderCancel/:odr/:item',verifyAdminLogin,(req,res)=>{
                try{
                  let data='Cancelled'
                  adminHelper.orderStatusUpdate(req.params.odr,req.params.item,data).then((response)=>{
                   adminHelper.ordercancel(req.params.odr,req.params.item,data)
                    res.redirect('/admin/orders')
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
               })

               router.get('/coupons',verifyAdminLogin,(req,res)=>{
                try{
                  adminHelper.getCoupons().then((coupons)=>{
                   
                    res.render('admin/admin-coupons',{layout:'adminLayout',adminLoggedin,coupons})
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
              
               })
               router.post('/add-coupon',verifyAdminLogin,(req,res)=>{
                try{
                  
                  adminHelper.createCoupon(req.body).then((data)=>{
                    res.redirect('/admin/coupons')
                  
                  })
                }
                catch(err){
                  res.redirect('/admin')
                }
               
              
              })
            
              router.get('/deleteCoupon/:id',verifyAdminLogin,(req,res)=>{
                adminHelper.deleteCoupon(req.params.id).then(()=>{
                  res.redirect('/admin/coupons')
                })
              })
              router.get('/*',(req,res)=>{
                res.render('admin/admin-error')
              })
    
module.exports = router;
