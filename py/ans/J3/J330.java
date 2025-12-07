import java.util.*;

public class J330 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        System.out.print((a << 1) + (b >> 1) + (a ^ c) - (b % a));
    }
}
