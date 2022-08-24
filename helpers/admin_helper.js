let db=require('../config/connections') 
let collection=require('../config/collection')
const bcrypt=require('bcrypt')
const async=require('hbs/lib/async')
const { USER_COLLECTION } = require('../config/collection')
const { response } = require('express')
let objectid=require('mongodb').ObjectId
module.exports={
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminemaildb:adminData.emailadmin})
        if(admin){
                if(adminData.passwordadmin===admin.adminpassworddb){
                        console.log('login success');
                        response.admin=admin
                        response.status=true
                        resolve(response)
                     }else{
                        console.log('login failed');
                        resolve({status:false})
                     }
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                }
        )   
            },
            vendorlist:()=>{
                return new Promise(async(resolve,reject)=>{
                   let vendors=await db.get().collection(collection.VENDOR_COLLECTION).find({Approve:true}).toArray()
                   let vendorrequest=await db.get().collection(collection.VENDOR_COLLECTION).find({Approve:false}).toArray()
                
                   resolve({vendors,vendorrequest})
                }  )
            },
            userlist:()=>{
                return new Promise(async(resolve,reject)=>{
                   let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
                   resolve(users)
                   console.log(users);
                }  )
            },
            getAllProducts:()=>{
                return new Promise(async(resolve,reject)=>{
                    let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                    resolve(products)
                })
            },
            addProduct:(product)=>{
                product.Price=parseInt(product.Price)
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
                    return new Promise(async(resolve,reject)=>{
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
                blockUser:(userid)=>{
                    return new Promise((resolve,reject)=>{
                        db.get().collection(USER_COLLECTION).updateOne({_id:objectid(userid)},{$set:
                            {
                            userBlocked:true }},{upsert:true}).then((response)=>{
                                resolve(response)
                            })
                        })
                    },
                    unblockUser:(userid)=>{
                        return new Promise((resolve,reject)=>{
                            db.get().collection(USER_COLLECTION).updateOne({_id:objectid(userid)},{$set:
                                {
                                userBlocked:false }}).then((response)=>{
                                    resolve(response)
                                })
                            })
                        },
                        
                        deleteuser:(userid)=>{
                            return new Promise((resolve,reject)=>{ 
                              db.get().collection(collection.USER_COLLECTION).deleteOne({_id:objectid(userid)}).then((response)=>{
                                console.log(response);
                                resolve(response)
                            })
                            
                                
                            })
                        },
                        blockVendor:(vendorid)=>{
                            return new Promise((resolve,reject)=>{
                                db.get().collection(collection.VENDOR_COLLECTION).updateOne({_id:objectid(vendorid)},{$set:
                                    {
                                    vendorBlocked:true }},{upsert:true}).then((response)=>{
                                        resolve(response)
                                    })
                                })
                            },
                            unblockVendor:(vendorid)=>{
                                return new Promise((resolve,reject)=>{
                                    db.get().collection(collection.VENDOR_COLLECTION).updateOne({_id:objectid(vendorid)},{$set:
                                        {
                                        vendorBlocked:false }}).then((response)=>{
                                            resolve(response)
                                        })
                                    })
                                },
                                deleteVendor:(vendorid)=>{
                                    return new Promise((resolve,reject)=>{
                                      console.log(prodId); 
                                      db.get().collection(collection.VENDOR_COLLECTION).deleteOne({_id:objectid(vendorid)}).then((response)=>{
                                        console.log(response);
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
                                        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({Category:category.Category},{$set:{Category:category.Category}},{upsert:true}).then((data)=>{
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
                    
                                },
                                approvevendor:(vendorid)=>{
                                    return new Promise((resolve,reject)=>{
                                        db.get().collection(collection.VENDOR_COLLECTION).updateOne({_id:objectid(vendorid)},{$set:{Approve:true}}).then((response)=>{
                                          resolve(response)  
                                        })
                                    })
                                },
                                rejectvendor:(vendorid)=>{
                                    return new Promise((resolve,reject)=>{
                                        db.get().collection(collection.VENDOR_COLLECTION).deleteOne({_id:objectid(vendorid)}).then((response)=>{
                                          resolve(response)  
                                        })
                                    })
                                },
                                getOrders:()=>{
                                    return new Promise(async(resolve,reject)=>{
                                     let orders=await   db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                            {
                                              '$unwind': {
                                                'path': '$products'
                                              }
                                            }, {
                                              '$unwind': {
                                                'path': '$products.products'
                                              }
                                            }, {
                                              '$lookup': {
                                                'from': 'product', 
                                                'localField': 'products.products.item', 
                                                'foreignField': '_id', 
                                                'as': 'productDetails'
                                              }
                                            }, {
                                              '$unwind': {
                                                'path': '$productDetails'
                                              }
                                            }, {
                                              '$addFields': {
                                                'total': {
                                                  '$multiply': [
                                                    '$products.products.quantity', '$productDetails.Price'
                                                  ]
                                                }
                                              }
                                            },{
                                                '$sort': {
                                                  'date': -1
                                                }
                                              }
                                          ]).toArray()
                                          resolve(orders)
                                    })
                                },
                                
                                updateBanner:(data)=>{
                                    return new Promise(async(resolve,reject)=>{
                                        db.get().collection(collection.BANNER_COLLECTION).updateOne({Name:data.Name},
                                            {$set:{Name:data.Name,Category:data.Category,Description:data.Description}},
                                            {upsert:true}).then((data)=>{
                                            console.log(data);
                                            resolve()
                                        })
                                    })
                                },
                                getBanner:()=>{
                                    return new Promise(async(resolve,reject)=>{
                                      let banner= await  db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                                      resolve(banner)
                                      console.log(banner);
                                    })
                                },
                                orderStatusUpdate:(odr,item,data)=>{
                                   
                                    return new Promise((resolve,reject)=>{
                                        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(odr),'products.products.item':objectid(item)},{
                                            $set:{
                                                'products.$.products.orderStatus':data

                                            }
                                        }).then(()=>{
                                            resolve(response)
                                        })
                                         
                                    })
                                },
                                ordercancel:(odr,item)=>{
                                   
                                    return new Promise((resolve,reject)=>{
                                        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(odr),'products.products.item':objectid(item)},{
                                            $set:{
                                                'products.$.products.Cancelled':"Order declined by Admin"
                                            }
                                        },{upsert:true})
                                         
                                    })
                                },
                                createCoupon:(data)=>{
                                    return new Promise(async(resolve,reject)=>{
                                        
                                     let expire=parseInt(data.validity)*86400
                                      db.get().collection(collection.COUPON_COLLECTION).createIndex( { "lastModifiedDate": 1 }, { expireAfterSeconds: expire } )
                                      
                                      await  db.get().collection(collection.COUPON_COLLECTION).insertOne({'couponCode':data.couponCode,
                                        'offerType':data.offerType,
                                        'couponValue':data.couponValue,
                                        'validity':data.validity,
                                        'createdOn': new Date().toLocaleString(),
                                    'lastModifiedDate': new Date()}).then((response)=>{
                                        resolve(response)
                                      }) 
                                    })
                                },
                                getCoupons:()=>{
                                    return new Promise(async(resolve,reject)=>{
                                  let coupons= await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                                  console.log(coupons);
                                  resolve(coupons)
                                    })
                                },
                                totalUsers:()=>{
                                return new Promise(async(resolve,reject)=>{
                                    try{
                                        let totalUser= await db.get().collection(collection.USER_COLLECTION).estimatedDocumentCount()
                                        resolve(totalUser)
                                    }
                                    catch(err){
                                        reject(err)
                                    }
                                    
                                })
                                },
                                totalOrder:()=>{
                                    return new Promise(async(resolve,reject)=>{
                                        try{
                                            let totalOrder= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$addFields': {
                                                    'total': {
                                                      '$multiply': [
                                                        '$products.products.quantity', '$products.products.product.Price'
                                                      ]
                                                    }
                                                  }
                                                }, {
                                                  '$addFields': {
                                                    'discount': {
                                                      '$divide': [
                                                        {
                                                          '$multiply': [
                                                            '$total', '$discountDetails.couponValue'
                                                          ]
                                                        }, 100
                                                      ]
                                                    }
                                                  }
                                                }, {
                                                  '$addFields': {
                                                    'finalPrice': {
                                                      '$subtract': [
                                                        '$total', '$discount'
                                                      ]
                                                    }
                                                  }
                                                }
                                              ]).toArray()
                                             
                                            resolve(totalOrder.length)
                                        }
                                        catch(err){
                                            reject(err)
                                        }
                                        
                                    })
                                    },
                                    totalSale:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                         let totalSale= await  db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                            {
                                              '$unwind': {
                                                'path': '$products'
                                              }
                                            }, {
                                              '$unwind': {
                                                'path': '$products.products'
                                              }
                                            }, {
                                              '$match': {
                                                '$or': [
                                                  {
                                                    'products.products.orderStatus': 'Placed'
                                                  }, {
                                                    'products.products.orderStatus': 'Shipped'
                                                  }, {
                                                    'products.products.orderStatus': 'Delivered'
                                                  }
                                                ]
                                              }
                                            }, {
                                              '$group': {
                                                '_id': null, 
                                                'sum': {
                                                  '$sum': '$totalAmount'
                                                }
                                              }
                                            }
                                          ]) .toArray()
                                          resolve(totalSale[0].sum)
                                        })
                                    },
                                    totalCOD:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                            let totalCOD= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$match': {
                                                    '$and': [
                                                      {
                                                        'paymentMethod': 'COD'
                                                      }, {
                                                        '$or': [
                                                          {
                                                            'products.products.orderStatus': 'Placed'
                                                          }, {
                                                            'products.products.orderStatus': 'Shipped'
                                                          }, {
                                                            'products.products.orderStatus': 'Delivered'
                                                          }
                                                        ]
                                                      }
                                                    ]
                                                  }
                                                }
                                              ]).toArray()
                                              resolve(totalCOD.length)
                                        })
                                    },
                                    onlinePaymentCount:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                            let onlinePaymentCount= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$match': {
                                                    '$and': [
                                                      {
                                                        'paymentMethod': 'Online'
                                                      }, {
                                                        '$or': [
                                                          {
                                                            'products.products.orderStatus': 'Placed'
                                                          }, {
                                                            'products.products.orderStatus': 'Shipped'
                                                          }, {
                                                            'products.products.orderStatus': 'Delivered'
                                                          }
                                                        ]
                                                      }
                                                    ]
                                                  }
                                                }
                                              ]).toArray()
                                              resolve(onlinePaymentCount.length)
                                        })
                                    },
                                    totalPending:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                         let totalPending=await   db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$match': {
                                                    'products.products.orderStatus': 'Pending'
                                                  }
                                                }
                                              ]).toArray()
                                              resolve(totalPending.length)
                                        })
                                    },
                                    totalPlaced:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                         let totalPlaced=await   db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$match': {
                                                    'products.products.orderStatus': 'Placed'
                                                  }
                                                }
                                              ]).toArray()
                                              resolve(totalPlaced.length)
                                        })
                                    },
                                    totalShipped:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                         let totalShipped=await   db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$match': {
                                                    'products.products.orderStatus': 'Shipped'
                                                  }
                                                }
                                              ]).toArray()
                                              resolve(totalShipped.length)
                                        })
                                    },
                                    totalDelivered:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                         let totalDelivered=await   db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$match': {
                                                    'products.products.orderStatus': 'Delivered'
                                                  }
                                                }
                                              ]).toArray()

                                              resolve(totalDelivered.length)
                                        })
                                    },
                                    totalCancelled:()=>{
                                        return new Promise(async(resolve,reject)=>{
                                         let totalCancelled=await   db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                {
                                                  '$unwind': {
                                                    'path': '$products'
                                                  }
                                                }, {
                                                  '$unwind': {
                                                    'path': '$products.products'
                                                  }
                                                }, {
                                                  '$match': {
                                                    'products.products.orderStatus': 'Cancelled'
                                                  }
                                                }
                                              ]).toArray()
                                              resolve(totalCancelled.length)
                                        })
                                    }
                                
            
                 
            }
        
