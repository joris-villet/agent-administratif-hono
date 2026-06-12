export type FileInfo = {
  ok: boolean;
  result: {
    file_id: string;
    file_path: string;
  };
};

type Photo = {
  file_id: string;
};

export interface JsonTelegram {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      language_code: string;
    };
    chat: {
      id: number;
      first_name: string;
      type: string;
    };
    date: number;
    text: string;
    document?: {
      file_name: string;
      mime_type: string;
      file_id: string;
      file_unique_id: string;
      file_size: number;
    };
    caption?: string;
    voice?: {
      duration: number;
      mime_type: string;
      file_id: string;
      file_unique_id: string;
      file_size: number;
    };
    video_note?: {
      duration: number;
      length: number;
      thumbnail: [Object];
      thumb: [Object];
      file_id: string;
      file_unique_id: string;
      file_size: number;
    };
    photo?: Photo[];
  };
}
