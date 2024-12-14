export interface ICommentCreateDto {
  text: string;
  blogId: number;
  replyCommentId: number;
  isReplyComment: boolean;
}
