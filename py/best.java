import java.util.*;

public class best {
    public static void main(String[] x) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        int sum = 0;
        for (char c : s.toCharArray())
            if (Character.isDigit(c))
                sum += c - '0';
        System.out.print(sum);
    }
}
