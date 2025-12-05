import java.util.*;

public class J506 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] x = { sc.nextInt(), sc.nextInt(), sc.nextInt() };
        int sum = 0;
        for (int v : x) {
            sum += v;
        }
        System.out.print(sum);
    }
}
