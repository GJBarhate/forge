import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import useStore from '../store/useStore'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)
  const updateAnalytics = useStore((s) => s.updateAnalytics)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/analytics', (message) => {
          try {
            const data = JSON.parse(message.body)
            updateAnalytics(data)
          } catch (e) {
            // Ignore parse errors
          }
        })
      },
      onDisconnect: () => {
        setConnected(false)
      },
      onStompError: () => {
        setConnected(false)
      }
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [updateAnalytics])

  return { connected }
}
