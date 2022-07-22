import colors from 'colors'

// const debugA = createDebug('debugA:')
export const errorHandler = (
  error: { statusCode: number; message: string },
  req: any,
  res: any,
  next: any
) => {
  console.log(
    `发生了错误: statusCode: ${error.statusCode ?? 500}, message: ${
      error.message
    }`
  )
  const status = error.statusCode ?? 500
  const message = error.message
  res.status(status).json({ message: message })
}
