import { supabase } from '../../supabaseClient';

// 記事の公開状態を取得する関数
export const getBlogPublishedStatus = async (blogId: string) => {
    const { data, error } = await supabase
        .from('blogs')
        .select('published')
        .eq('id', blogId)
        .single();
    if (error) {
        throw new Error('記事の取得に失敗しました');
    }
    return data.published;
};

// 公開状態の切り替え処理
export const toggleBlogPublishStatus = async (blogId: string, currentStatus: boolean) => {
    try {
        const { error } = await supabase
            .from('blogs')
            .update({ published: !currentStatus })
            .eq('id', blogId);

        if (error) {
            throw new Error('公開状態の切り替えに失敗しました');
        }

        return !currentStatus; // 切り替えた新しい状態を返す
    } catch (error) {
        console.error('エラー:', error);
        alert('エラーが発生しました。');
        throw error;
    }
};
