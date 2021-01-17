import React, { useEffect, useState } from 'react'
import socketIOClient from 'socket.io-client'
import { SimpleGrid } from '@chakra-ui/react'
import Order from './Order'

const Orders = () => {
  const [ orders, setOrders ] = useState([])

  useEffect( () => {
    (async () => {
      const response = await fetch("http://localhost:3001/orders")
      const orders = await response.json()
      setOrders(orders)
    })()

    const socket = socketIOClient("http://localhost:3001", {
      transports: ["websocket"]
    })

    socket.on("newOrder", (order) => {
      setOrders(
        (prevState) => [order, ...prevState],
      )
    })

    socket.on("statusChange", (updateOrder) => {
      setOrders(
        (prevState) => (prevState.map((order) => (
          order._id === updateOrder._id ? updateOrder : order
        )))
      )
    })
  }, [])

  const handleStatusChange = (order) => {
    return ({ target: { value } }) => {
      fetch(`http://localhost:3001/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: value }),
      })
    }
  }

  return (
    <SimpleGrid mt="3rem" columns={[1, 1, 2, 2]} gap="2rem">
      {orders.map((order) => (
        <Order 
          key={order._id} 
          status={order.status}
          id={order._id} 
          table={order.table}
          description={order.description}
          onChange={handleStatusChange(order)}
        />
      ))}
    </SimpleGrid>
  )
}

export default Orders
