import java.util.*;

class Counter712 {
    static int count = 0;

    Counter712() {
        count++;
    }
}

public class J712 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            new Counter712();
        }
        System.out.print(Counter712.count);
    }
}
