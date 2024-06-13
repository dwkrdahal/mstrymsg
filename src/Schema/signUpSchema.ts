import {z} from 'zod'

const usernameRegex = /^[a-zA-Z0-9_]+$/;

export const usernameValidation = z
  .string()
  .min(2, {message: "username must be atleast 2 characters"})
  .max(20, {message: "username must not exceed 20 characters"})
  .regex(usernameRegex, {message: "username mustnot contain special characters"})

export const emailValidation = z
  .string()
  .email({message: 'Invalid email address'})

export const passwordvalidation = z
  .string()
  .min(6, {message: "password must be atleast 6 characters"})

export const signUpSchema = z.object({
  username: usernameValidation,
  email: emailValidation,
  password: passwordvalidation
})