import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
    api: {
        bodyParser: false,
    },
}

/**
 * Socket.io status endpoint
 *
 * Socket.io server runs as a separate Podman container on port 3011.
 * This endpoint just provides status information.
 */
const SocketHandler = (_req: NextApiRequest, res: NextApiResponse) => {
    const socketServerUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:3011'

    res.status(200).json({
        status: 'ok',
        message: 'Socket.io server is running as a separate service',
        socketServer: socketServerUrl,
        path: '/socket.io'
    })
}

export default SocketHandler
