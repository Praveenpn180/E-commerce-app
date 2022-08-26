let db=require('../config/connections') 
let collection=require('../config/collection')
const bcrypt=require('bcrypt')
let objectid=require('mongodb').ObjectId
module.exports={
    doSignup:(vendorData)=>{
        return new Promise(async(resolve,reject)=>{
            vendorData.Password=await bcrypt.hash(vendorData.Vpassword,10)
            console.log(vendorData);
            vendorData.up2=null;
            vendorData.Approve=false;
            db.get().collection(collection.VENDOR_COLLECTION).insertOne(vendorData).then((data)=>{
            resolve(data.insertedId)
            })
            
        })
 

    },
    doLogin:(vendorData)=>{
        console.log(vendorData.vemail);
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            
            let vendor=await db.get().collection(collection.VENDOR_COLLECTION).findOne({Vemail:vendorData.vemail,vendorBlocked:false})
            let vendorstatus=await db.get().collection(collection.VENDOR_COLLECTION).findOne({Vemail:vendorData.vemail,vendorBlocked:true})
           
            if(vendor){
                bcrypt.compare(vendorData.vpassword,vendor.Password).then((status)=>{
                    if(status){
                        console.log('login success');
                        response.vendor=vendor
                        response.status=true
                        resolve(response)
                        
                     }else{
                        console.log('login failed');
                        resolve({status:false})
                     }
                })
               

               
            }else if(vendorstatus){
                response.blockStatus=true
                response.status=false
                console.log(response);
                resolve(response)
             }else{
                console.log('login failed');
                resolve({status:false})
             }
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    addProduct:(product)=>{
                return new Promise(async(resolve,reject)=>{
                    db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                        console.log(data.insertedId);
                        resolve(data.insertedId)  
                    })
                        
                })
        
        },
        deleteProduct:(prodId)=>{
            return new Promise((resolve,reject)=>{
              console.log(prodId); 
              db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectid(prodId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
            
                
            })
        },
        getProductDetails:(proId)=>{
            return new Promise((resolve,reject)=>{
               db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectid(proId)}).then((product)=>{
                resolve(product)
               }) 
            }) 
        },
        updateProduct:(proId,proDetails)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectid(proId)},{
                    $set:{
                        Name:proDetails.Name,
                        Description:proDetails.Description,
                        Price:parseInt(proDetails.Price),
                        Category:proDetails.Category
                    }
                }).then((response)=>{
                    resolve(response)
                })
            })
        },
        viewCategories:()=>{
            return new Promise(async(resolve,reject)=>{
             let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
             resolve(category)
            })
        }

        ,
        addCategory:(category)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
                    resolve(data)
                })
            })
        },
        deleteCategory:(categoryid)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectid(categoryid)}).then((response)=>{
                    resolve(response)
            })
            
            })
        }


}