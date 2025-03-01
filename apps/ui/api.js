import * as fs from 'fs';

let _db = {
    conversations: []
}

try {
    _db = JSON.parse(fs.readFileSync('./db.json'));
} catch {}

function createProxy(target, prop) {
    if (typeof target[prop] == 'object') {
        if (Array.isArray(target[prop])) {
            if (target[prop].push.toString().includes('native code')) {
                target[prop].push = new Proxy(target[prop].push, {
                    apply(t, g, a) {
                        var a = Reflect.apply(t, g, a)

                        saveDB()

                        return a;
                    }
                })

                target[prop].push.toString = () => "nah"
            }

            return target[prop]
        }

        return new Proxy(target[prop], {
            get(target, prop) {
                return createProxy(target, prop)
            },
            set(target, prop, value) {
                Reflect.set(target, prop, value)

                saveDB()

                return value;
            }
        })
    } else {
        return target[prop]
    }
}

function saveDB() {
    fs.writeFileSync('./db.json', JSON.stringify(_db))
}

const db = new Proxy(_db, {
    get(target, prop) {
        return createProxy(target, prop)
    },
    set(target, prop, value) {
        Reflect.set(target, prop, value)

        saveDB()

        return value;
    }
})

function id(num) {
    let seg = () => Math.floor(Math.random() * 1e+10).toString(19)

    return Array.from('*'.repeat(num)).map(e => seg()).join('-')
}

const api = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        return res.end()
    }

    res.setHeader('Access-Control-Allow-Origin', '*')

    if (req.method === 'GET') {
        if (req.url === '/api/conversations/all') {
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify(db.conversations.map(e => ({
                name: e.name,
                id: e.id,
                created: e.created,
                lastMessage: e.lastMessage
            }))))
        }
    }

    if (req.method !== 'POST') {
        res.statusCode = 405
        return res.end('Method Not Allowed')
    }

    const chunks = []
    for await (const chunk of req) {
        chunks.push(chunk)
    }

    const body = Buffer.concat(chunks).toString()

    if (req.url === '/api/conversations/get') {
        const data = JSON.parse(body);
        const conversation = db.conversations.find(c => c.id === data.id)
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(conversation))
    }
    if (req.url === '/api/conversations/create') {
        const conversation = JSON.parse(body)
        conversation.id = id(4)
        conversation.created = Date.now()
        conversation.lastMessage = Date.now()
        db.conversations.push(conversation)
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(conversation))
    }
    if (req.url === '/api/conversations/save') {
        const conversation = JSON.parse(body);
        const { id } = conversation;
        const index = db.conversations.findIndex(convo => convo.id === id);

        db.conversations[index] = conversation

        saveDB()

        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({'success': true}))
    }

    res.statusCode = 404
    res.end('Not Found')
}

export default api