export interface StoryItem {
  id: string;
  beforeImg: string;
  afterImg: string;
  title: string;
  description: string;
}

export interface StoriesData {
  title?: string;
  subtitle?: string;
  stories: StoryItem[];
}
