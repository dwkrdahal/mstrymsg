import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request) {
  await dbConnect()

  try {
    const {username, email, password} = await request.json()

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true
    })

    if(existingUserVerifiedByUsername){
      return Response.json({
        success: false,
        message: "username is already taken"
      }, {status: 400})
    }

    const existingUserByEmail =await UserModel.findOne({email})
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    if(existingUserByEmail){
      if(existingUserByEmail.isVerified){
        return Response.json({
          success: false,
          message: "user with this email already taken"
        }, {status: 400})
        
      } else{
        const hasedPassword = await bcrypt.hash(password, 10)
        const expiryDate = new Date(Date.now() + 360000)

        existingUserByEmail.password = hasedPassword;
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.verifyCodeExpiry = expiryDate

        await existingUserByEmail.save()
      }
    } else{
      const hasedPassword = await bcrypt.hash(password, 10)
      const expiryDate = new Date()
      expiryDate.setMinutes(expiryDate.getMinutes() + 60)

      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: []
      })

      await newUser.save();
    }
    
    //send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if(emailResponse.success){
      return Response.json({
        success: false,
        message: emailResponse.message
      }, {status: 500})
    }

    return Response.json({
      success: true,
      message: "user registered successfully. please verify your email"
    }, {status: 201})

  } catch (error) {
    console.error('Error registering user', error)
    return Response.json(
      {
        success: false,
        message: "Error registering user"
      }
    )
  }
  
}