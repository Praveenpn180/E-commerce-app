let db = require('../config/connections')
let collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { response } = require('express')
const { use } = require('../routes/users')
let objectid = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { resolve } = require('path')
let instance = new Razorpay({
    key_id: 'rzp_test_XSeC3SUWTQQoHS',
    key_secret: 'BIaMtjvZMyyWopKO2xp1lBeM',
});
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            console.log(userData);
            userData.up2 = null
            userData.userBlocked = false
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            })

        })


    },
    checkUnique: (userData) => {
        return new Promise(async (resolve, reject) => {
            let phone = null
            let email = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            phone = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.phone }).then(() => {
                console.log(email);
                if (email) {
                    response.emailexist = true
                    resolve(response)
                    console.log("email exist");
                } else if (phone) {
                    response.phoneexist = true
                    resolve(response)
                    console.log("phone exist")
                }
                else {
                    console.log('dddddddd');
                    resolve(response)
                }
            })
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.Email, userBlocked: false })
            let userStatus = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.Email, userBlocked: true })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {

                        console.log('login success');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else if (userStatus) {
                response.blockStatus = true
                response.status = false
                resolve(response)
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    getProductDetails: (cat) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: cat }).toArray()
            resolve(product)
        })

    },
    viewCategories: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    getProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectid(id) })
                resolve(product)
            }
            catch (err) {
                reject(err)
            }

        })
    },
    addToCart: (data, userId) => {
        let proObj = {
            item: objectid(data.proId),
            quantity: parseInt(data.quantity)

        }

        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectid(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == data.proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectid(userId), 'products.item': objectid(data.proId) },
                            {
                                $inc: { 'products.$.quantity': data.quantity }
                            }).then(() => {
                                resolve()
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectid(userId) },
                        { $push: { products: proObj } }
                    ).then((response) => {
                        resolve()
                    })
                }

            } else {
                let cartObj = {
                    user: objectid(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    addToWishlist: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            let item = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectid(userId),
                wishlist: { $in: [{ item: objectid(proId) }] }
            })
            console.log(item);
            if (!item) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) },
                    { $push: { wishlist: { item: objectid(proId) } } }, { upsert: true }).then((response) => {
                        resolve({data:'added'})
                    })
            }else{
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) },
                { $pull: { wishlist: { item: objectid(proId) } } }).then((response) => {
                    resolve({data:'removed'})
                })
            }

        })

    },
    viewWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectid(userId) }
                }, {
                    $unwind: '$wishlist'
                }, {
                    $project: {
                        item: '$wishlist.item'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productdetails'
                    }
                },
                {
                    $project: {
                        productdetails: { $arrayElemAt: ['$productdetails', 0] }
                    }
                }
            ]).toArray()
            if (wishlist) {
                resolve(wishlist)
            } else {
                resolve()
            }

            console.log(wishlist);
        })
    }
    ,
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectid(userId) }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] },
                    }

                }, {
                    '$addFields': {
                        'productTotal': {
                            '$sum': {
                                '$multiply': [
                                    '$quantity', '$products.Price'
                                ]
                            }
                        }
                    }
                }

            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectid(userId) })
            if (cart) {
                count = cart.products.length
            }
            if (count) {
                resolve(count)
            } else {
                resolve(count = 0)
            }

        })
    },
    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wcount = 0
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectid(userId) })
            if (user.wishlist) {
                wcount = user.wishlist.length
            }
            resolve(wcount)
        })
    }
    ,
    changeProductQuantity: (details) => {
        console.log(details);
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                console.log("jhjhjhjhjhjhjhjhjhjhjh");
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectid(details.cart) },
                        {
                            $pull: { products: { item: objectid(details.product) } }
                        }).then((response) => {

                            resolve({ removeProduct: true })
                        })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectid(details.cart), 'products.item': objectid(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {
                            resolve({ status: true })
                        })

            }
        })
    },
    getTotalAmound: (userId) => {

        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectid(userId) }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$products.Price'] } }
                    }
                }

            ]).toArray()

            if (total.length == 0) {
                resolve(total)
            } else {
                resolve(total[0].total)
            }

        })
    },
    removeWishlist: (proId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) },
                { $pull: { wishlist: { item: objectid(proId) } } })
            resolve()
            console.log('suddddd');
        })
    },
    removeFromCart: (userId, proId) => {
        console.log('hgygyg');
        db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectid(userId) },
                {
                    $pull: { products: { item: objectid(proId) } }
                })

        resolve(response)

    },
    placeOrder: (order, products, totalPrice, address, coupon) => {


        return new Promise(async (resolve, reject) => {
            console.log(order, products, totalPrice);
            let status = order.paymentMethod === 'COD' ? 'Placed' : 'Pending'

            let total = parseInt(totalPrice)
            let Discount = 0
            if (coupon) {
                Discount = (parseInt(totalPrice) / 100) * parseInt(coupon.couponValue)
               db.get().collection(collection.COUPON_COLLECTION).updateOne({'couponCode':coupon.couponCode},{$push:{'couponAppliedUser':order.userId}})
            } else {
                coupon = {
                    couponCode: 0,
                    offerType: 0,
                    couponValue: 0
                }

            }
            console.log(coupon);

            let orderObj = {
                deliveryDetails: {
                    Name: address.firstName + ' ' + address.lastName,
                    Email: address.email,
                    Phone: address.Phone,
                    Address: address.Address,
                    City: address.City,
                    State: address.State,
                    Pincode: address.Pincode,
                    date: Date()
                },
                userId: objectid(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalPrice: total,
                discount: Discount,
                totalAmount: (totalPrice - Discount),
                date: new Date().toLocaleString(),
                status: status,
                discountDetails: {

                    couponCode: coupon.couponCode,
                    offerType: coupon.offerType,
                    couponValue: parseInt(coupon.couponValue)
                }

            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectid(order.userId) })
               

                resolve(response.insertedId)
            })
        })
    },
    getCartProductslist: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let cart = {}
            cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        user: objectid(userId)
                    }
                }, {
                    $unwind: {
                        path: "$products"
                    }
                }, {
                    $lookup:
                    {
                        from: "product",
                        localField: 'products.item',
                        foreignField: '_id',
                        as: "products.product"
                    }

                }, {
                    $unwind: {
                        path: '$products.product'
                    }
                }, {
                    $addFields: {
                        'products.orderStatus': "Placed"
                    }
                }

            ]).toArray()

            resolve(cart)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    '$match': {
                        'userId': objectid(userId)
                    }
                }, {
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
                }, {
                    '$sort': {
                        'date': -1
                    }
                }
            ]).toArray()

            console.log(orders);
            resolve(orders)
        })

    },
    getOrderProducts: (orderId, item) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    '$match': {
                        '_id': objectid(orderId)
                    }
                }, {
                    '$unwind': {
                        'path': '$products'
                    }
                }, {
                    '$match': {
                        'products.products.item': objectid(item)
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
            resolve(orderItems)

        })
    },
    generateRazorpay: (orderId, total) => {

        return new Promise(async (resolve, reject) => {
            let options = {
                amount: total,
                currency: "INR",
                receipt: "" + orderId,
            }
            instance.orders.create(options, function (err, order) {
                if (err) {

                    console.log(err);
                } else {

                    console.log(order);
                    resolve(order)
                }
            })


        })
    },
    verifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            let crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'BIaMtjvZMyyWopKO2xp1lBeM')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectid(orderId) }, {
                $set: {
                    status: 'Placed'
                }
            }).then(() => {
                resolve()
            })
        })
    },
    addAddress: (userId, data) => {
        let addressId = new objectid()
        data.addressId = addressId
        data.date = new Date()
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, {
                $push: { address: data }
            }).then((response) => {
                resolve(response)
            })

        })
    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectid(userId)
                    }
                }, {
                    $unwind: {
                        path: '$address'
                    }
                }, {
                    $project: {
                        'address': 1
                    }
                }
            ]).toArray()
            resolve(address)

        })
    },
    getDeliveryAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectid(userId)
                    }
                }, {
                    $unwind: {
                        path: '$address'
                    }
                }, {
                    $match: {
                        'address.addressId': objectid(addressId)
                    }
                }, {
                    $project: {
                        address: 1
                    }
                }
            ]).toArray()
            resolve(address[0].address)
        })
    },
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
            console.log(banner);
        })
    },
    orderCancel: (id, item) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectid(id), 'products.products.item': objectid(item) }, {
                $set: {
                    'products.$.products.orderStatus': 'Cancelled',
                    'products.$.products.Cancelled': "Order cancelled"

                }
            }, { upsert: true }).then((response) => {
                resolve(response)
            })
        })

    },
    userProfileUpdate: (id, data) => {
        return new Promise(async (resolve, reject) => {
            console.log(data);
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(id) }, {
                $set: {
                    'Address': data.Address,
                    'City': data.City,
                    'State': data.State,
                    'Pincode': data.Pincode
                }
            })
            resolve(response)
        })
    },
    getUserDetails: (email) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ 'email': email })
            if (user) {
                resolve(user)
            } else {
                resolve(user = false)
            }


        })
    },
    resetPassword: (email, password) => {
        return new Promise(async (resolve, reject) => {
            console.log(password);
            let Password = await bcrypt.hash(password, 10)
            console.log(Password);
            db.get().collection(collection.USER_COLLECTION).updateOne({ 'email': email }, {
                $set: {
                    'Password': Password
                }
            })
            resolve(response)
            console.log(response);
        })
    },
    editDeliveryAddress: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            ddd = data.id
            console.log(data, userId);
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId), 'address.addressId': objectid(data.id) }, {
                $set: {
                    'address.$.firstName': data.firstName,
                    'address.$.lastName': data.lastName,
                    'address.$.email': data.email,
                    'address.$.Phone': data.Phone,
                    'address.$.Address': data.Address,
                    'address.$.City': data.City,
                    'address.$.State': data.State,
                    'address.$.Pincode': data.Pincode
                }
            })
            resolve()
            console.log(response);
        })
    },
    checkCouponUsed:(coupon,userId)=>{
        return new Promise(async(resolve,reject)=>{
          let data=await  db.get().collection(collection.COUPON_COLLECTION).find({couponCode:coupon,couponAppliedUser:{$in:[userId]}}).toArray()
        
          if(data[0]){
            resolve({coupon:'Used'})
          
          }else{
        
            resolve({coupon:'Valid'})
          }
         
        })
    }
    ,
    getCoupon: (coupon) => {
        return new Promise(async (resolve, reject) => {
            let offer = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: coupon })
            resolve(offer)
           
        })
    }
    ,
    getAllCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    search: (data) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({ $text: { $search: data } }).toArray()
            resolve(result)

        })
    },
    deleteAddress:(id,userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectid(userId)},{$pull:{'address':{'addressId':objectid(id)}}})
            resolve()
        })
    }

}