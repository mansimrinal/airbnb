const express=require("express")
const app=express()
const mongoose=require("mongoose")
const port=8080

const path=require("path")
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

//const Listing=require("./models/listing.js")///schema hai listing.js mein
//const Review=require("./models/review.js")//schema of review

app.use(express.urlencoded({extended:true}))

const methodOverride=require("method-override")
app.use(methodOverride("_method"))

const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate)

app.use(express.static(path.join(__dirname,"/public")))

//const wrapAsync=require("./utils/wrapAsync.js")//error handling kaise honga using wrapasync use require kar rahe hai

const ExpressError=require("./utils/expressErr.js")//for error handling class  likhi gayi hai

//const {listingSchema}=require("./schema.js")//for server-side validation humne schema.js mein schema banaya hai using joi aur hume listingschema joi ke ojbect haiso yaha pe bhi hum object ke term mein usse require kar areh hai listingSchmea is a joi obejct for listing model
//const {reviewSchema}=require("./schema.js")//for server-side validation humne joi object banaya hai for review model that joiobejct is reviewSchmea
const passport=require("passport")//passport korequire kiya hai
const LocalStrategy=require("passport-local")//srategies of passport ko require kara hai
const User=require("./models/user.js")//require the user model

const listingRouter=require("./routes/listing.js")//listing routes ke liye alag se space bana rahe hai jaha sare routes sirf listing ke honge
const reviewRouter=require("./routes/review.js")//review routes ke liye alag se space bana rahe hai jaha sare review rotes honge sirf  review ke honge
const userRouter=require("./routes/user.js")//user route ko require kar rahe hai
const session=require("express-session")// express-session require kar rahe hai taki req.session ko track kar sakte hai

const sessionOptions={//yeh express session ke pass bhauttt sare options hote haiso to avoid the error we have to set some default value for those we can add in middleware but to avoid bulkyness we  use this method
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,//miliseconday mein hume expiry date likhna hai humare cookie ka
   //abhise ek hafte (7) days baad tak  and in milisecond bcz date.now return the  time  in milisecond
        maxAge:7*24*60*60*1000,
        httpOnly:true//for security purpose for avoiding xss(cross site attacks)
    }


}
const flash=require("connect-flash")//requiring flash



app.use(session(sessionOptions))//express-session middleware
app.use(flash())


//implenting the local strategies of passport
app.use(passport.initialize())//use karne se phele hume initialize karna honga
app.use(passport.session())
//methods of strategy of passport and these strategy can make new objects and instances
passport.use(new LocalStrategy(User.authenticate()))//methods of strategy of passport auhenticate is used forlogin and sign up
passport.serializeUser(User.serializeUser())//serializeUser is used for ki user ne apna sara data/information store kar liya in one session one session means 1.ek website ke dusre pages or routes mein jana 2.2nd tab mein usi website kokholna
passport.deserializeUser(User.deserializeUser())//this is used to remove the user information from the session after wesite is closed


app.get("/",(req,res)=>{
    res.send("root is working")
})

app.use((req,res,next)=>{//middleware for accessing flash  ,after adding a new listing ,hum chathe hai ki flash ho then we rote for that route req.flash but we have to acess somewhere using req.locals so hum middleware use kar rahe hai  
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")//foraccessing the flash
    res.locals.currUser=req.user
    next()//important to call
})

//app.get("/demouser",async(req,res)=>{
   // let fakeUser=new User({
      //  email:"student@gmial.com",
        //username:"delta-student"//bcz of passport local mongoose (humne schema mein username store nahi karaya tha )but by  defualt or automatically vo store kara dega
    //})
   //let registeredUser=await User.register(fakeUser,"helloworld")//yeh register method is used to save or store the username and password in database
   //res.send(registeredUser)

//})



app.use("/listings",listingRouter)//express router ,matlabh jaha jaha /listings  hai waha / rakhenge sirfpar request send karte waqt /listings se hi send karenge
app.use("/listings/:id/reviews",reviewRouter)//express router for review
app.use("/",userRouter)

main()
.then(()=>{
    console.log("connected to mongo data base")
}).catch((err)=>{
    console.log(err)
});

async function  main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}









///app.get("/listings",(req,res)=>{//kept for ki data mongo se app.js mein print ho raha hai ki nahi yeh dekhne ke liye
//Listing.find({}).then((res)=>{
        //console.log(res)
   // })

//})

//app.get("/testListing",async(req,res)=>{
   // let sampleListing=new Lis//ting({
     //   title:'My new Villa',
       // description:"By thr beach",
       // price:1200,
        //locations:"calanguate,Goa",
       // country:"india"
   // })
   // await sampleListing.save()
    //console.log("sample was saved")
    //res.send("root is working")

///})
app.all("*",(req,res,next)=>{//response for those routes jo match nahi ho rahe hai humare kisi bhi route se
    next(new ExpressError(404,"page not found"))// /random /user aise route aayenge jisme listing keyword na hon
})


app.use((err,req,res,next)=>{//yeh print honga jab koi error aayenga it is called server-side validation,matlbah agar price ko hum string ke form mein denge to error mein yeh print hongs
    let{status=500,message="something went wrong"}=err//response ke under koi bhi error message aayenga vo response lena ya deconstruct karna or isme default value dena important hai
    res.status(status).render("listings/error.ejs",{err})
    // res.status(status).send(message)//sabse akhri mein likthe hai error handling middleware ko
})
app.listen(port,()=>{
    console.log(`listening to the port ${port}`)
})

