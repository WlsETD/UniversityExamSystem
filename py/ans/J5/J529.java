import java.util.*;

public class J529 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int r = 0;

        while (n > 0) {
            r = r * 10 + n % 10; // 取尾數加到新數字後面
            n /= 10; // 去掉尾數
        }

        System.out.print(r);
    }
}
