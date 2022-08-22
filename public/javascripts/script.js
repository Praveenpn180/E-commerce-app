


function addToWishlist(proId){
    $.ajax({
        url:'/add-to-wishlist/'+proId,
        method:'get',
        success:(response)=>{
           
            document.getElementById('wcount').innerHTML=response.wcount
            
        }
    })
}


function moveToCart(proId){
    $.ajax({
        url:'/move-to-cart/'+proId,
        method:'get',
        success:()=>{
            swal({
                title: "Item moved to cart Successfully",
               
                icon: "success",
                buttons: true,
               
              })
              .then(() => {
        
               
                    location.reload()
                
              });
        
                   
              } 
            
        }
    )
}

function remove(proId){

    swal({
        title: "Are you sure you want to delete?",
       
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((confirm) => {

        if (confirm) {
            $.ajax({
                url:'/remove-from-wishlist/'+proId,
                method:'get',
                success:()=>{
                    swal("item has been removed from wishlist!", {
                        icon: "success"  })
                   }
                  
         })
         location.reload()
        } 
      });

           
      }
      