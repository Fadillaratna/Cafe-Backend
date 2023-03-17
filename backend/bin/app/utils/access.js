
const deniedMessage = {
  message: "Access Denied",
  err: null
}

const admin = async (req) => {
  const role = req.userData.role;
  console.log(role)
  if (role !== "admin") {
    return ({
      status: false,
      message: deniedMessage
    })
  }

  return ({
    status: true,
    message: "granted"
  })
}

const adminCashier = async (req) => {
  const role = req.userData.role
  console.log(role)
  if (role === "admin" || role === "cashier") {
    return ({
      status: true,
      message: "granted"
    })
  }

  return ({
    status: false,
    message: deniedMessage
  })
}

const cashierManager = async (req) => {
  const role = req.userData.role
  console.log(role)
  if (role === "manager" || role === "cashier") {
    return ({
      status: true,
      message: "granted"
    })
  }

  return ({
    status: false,
    message: deniedMessage
  })
}

const cashier = async (req) => {
  const role = req.userData.role
  console.log(role)
  if (role === "cashier") {
    return ({
      status: true,
      message: "granted"
    })
  }

  return ({
    status: false,
    message: deniedMessage
  })
}


const manager = async (req) => {
  const role = req.userData.role
  console.log(role)
  if (role === "manager") {
    return ({
      status: true,
      message: "granted"
    })
  }

  return ({
    status: false,
    message: deniedMessage
  })
}


module.exports = {
  admin,
  adminCashier,
  cashier,
  cashierManager,
  manager
}