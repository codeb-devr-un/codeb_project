
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Textarea } from "../ui/textarea"

export function PostDetail() {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-3.5 w-3.5" />
            수정
          </Button>
          <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 className="h-3.5 w-3.5" />
            삭제
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <Card className="shadow-sm border-border/40">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">테스트</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 text-foreground font-medium">
                천동은 (레오TV)
              </span>
              <Separator orientation="vertical" className="h-3" />
              <span>2025.11.29 08:11</span>
              <Separator orientation="vertical" className="h-3" />
              <span>2</span>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 min-h-[200px]">
          <p className="leading-7">테스트</p>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="shadow-sm border-border/40">
        <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                댓글 <span className="text-primary">(1)</span>
            </h3>
        </CardHeader>
        
        <CardContent className="space-y-6">
            {/* Comment Item */}
            <div className="flex gap-4">
                <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/avatars/01.png" />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">신</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">신봉준 (레오TV)</span>
                            <span className="text-muted-foreground text-xs">2025.11.29 08:23</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <button className="hover:text-foreground hover:underline">수정</button>
                            <button className="hover:text-destructive hover:underline">삭제</button>
                        </div>
                    </div>
                    <p className="text-sm">ㅇㅇㅇ</p>
                </div>
            </div>
        </CardContent>
        <Separator />
        <CardFooter className="pt-6 block">
            <div className="space-y-4">
                <Textarea 
                    placeholder="댓글을 입력하세요..." 
                    className="min-h-[100px] resize-none bg-muted/30 focus:bg-background transition-colors"
                />
                <div className="flex justify-end">
                    <Button>댓글 등록</Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  )
}
