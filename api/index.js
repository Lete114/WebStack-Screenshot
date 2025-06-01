import { serverless } from 'webstack-screenshot'
import { readdirSync } from 'fs'

export default (req, res) => {
  console.log('process.env', process.env)

  const fonts = process.env.WEBSTACK_SCREENSHOT_FONTS.split(',')
    .filter(Boolean)
  console.log('fonts', fonts)
  try {
    
 const dir= readdirSync('/tmp/fonts')
 console.log('dir',dir)
  } catch (error) {
    console.log('fonts error',error)
    
  }
  try {
    
 const dir= readdirSync('/tmp/.fonts')
 console.log('dir',dir)
  } catch (error) {
    console.log('.fonts error',error)
    
  }
  try {
    
 const dir= readdirSync('/tmp/fonts-cache')
 console.log('dir',dir)
  } catch (error) {
    console.log('fonts-cache error',error)
    
  }
  return serverless(req, res)
}
