import express from 'express'
const app = express()
import userroutes from './routes/UserRoutes.js'
import canvasroutes from './routes/CanvasRoutes.js'
app.use(express.json())
app.use('/auth',userroutes)
app.use*('/api',canvasroutes)
app.listen(3000,()=>{
console.log("running")})
