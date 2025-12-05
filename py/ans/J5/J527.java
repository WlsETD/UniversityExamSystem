import java.util.Scanner;

public class J527 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNext()) {
            String s = sc.next(); // 讀取輸入

            // 設定一個標籤 loop_block，用來指定 break 要跳出的位置
            loop_block: for (int i = 1; i <= 9; i++) {
                for (int j = 1; j <= i; j++) {
                    if (i * j > 50) {
                        System.out.println(i + " " + j);
                        break loop_block; // 直接跳出標記為 loop_block 的整個迴圈結構
                    }
                }
            }
        }
    }
}