import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Home() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Skype Clone</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Start chatting, calling, or video conferencing with your contacts.</p>
        </CardContent>
      </Card>
      {/* Add more cards for recent chats, calls, etc. */}
    </div>
  )
}

